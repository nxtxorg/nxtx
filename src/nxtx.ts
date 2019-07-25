/*  NxTx parser and renderer
    Author: Malte Rosenbjerg
    License: MIT */

import * as pegparser from './parser.js';
import { Parser } from "pegjs";
const parser : Parser = pegparser.default;

import map from 'awaity/map';
import mapSeries from 'awaity/mapSeries';
import reduce from 'awaity/reduce';
import {
    ArgumentCheckResult,
    CommandFunction,
    CommandResult,
    INxtx,
    Node,
    NodeType,
    Package,
    RenderEvent
} from "./types";


const register = (cmdCollection: object, cmd: string, fn: CommandFunction, overwrite: boolean = false): void => {
    if (!overwrite && cmdCollection[cmd] !== undefined)
        return console.warn(`Command '${cmd}' is already registered. Set overwrite to true, if you need to overwrite the already registered command.`);
    cmdCollection[cmd] = fn;
};

const noMerge = {'.': true, ',': true};
const mergeText = (paragraph: Node): Node => {
    const textNodes = [];
    const mergedNodes = paragraph.value.reduce((acc, node) => {
        if (node.type === NodeType.Text) {
            if (noMerge[node.value[0]]) {
                acc.push({type: NodeType.Text, value: node.value[0] + ' '});
                if (node.value.length !== 1) textNodes.push({type: NodeType.Text, value: node.value.substr(1)});
            } else textNodes.push(node);
        } else {
            if (textNodes.length) {
                acc.push({type: NodeType.Text, value: textNodes.map(n => n.value).join(' ')});
                textNodes.length = 0;
            }
            acc.push(node);
        }
        return acc;
    }, []);
    if (textNodes.length)
        mergedNodes.push({type: NodeType.Text, value: textNodes.map(n => n.value).join(' ')});
    return {type: paragraph.type, value: mergedNodes};
};

const truthy = e => !!e;

const flatMap = async (elements: Array<any>, fn: Function): Promise<Array<any>> => (await map(elements, fn)).flat();
const flatMapFilter = async (elements: Array<any>, fn: Function): Promise<Array<any>> => (await map(elements, fn)).flat().filter(truthy);
const flattenNodes = (nodes: Array<Node>): Array<Node> => {
    let cleanParagraph;
    let requiresNew = true;

    return nodes.reduce((flattened, current) => {
        if (current.type === NodeType.Paragraph) requiresNew = flattened.push(...flattenNodes(current.value)) && true;
        else {
            if (requiresNew) requiresNew = flattened.push(cleanParagraph = {
                type: NodeType.Paragraph,
                value: []
            }) && false;
            cleanParagraph.value.push(current);
        }
        return flattened;
    }, []).flat();
};

class Nxtx implements INxtx {
    private hooks = {
        prerender: new Array<Function>(),
        midrender: new Array<Function>(),
        postrender: new Array<Function>()
    };
    private registeredPackages = new Array<string>();
    private commands: { [key: string]: CommandFunction } = {};
    private preprocessors: { [key: string]: CommandFunction } = {};

    private static trigger(subscribers: Function[]): void {
        return subscribers.forEach(fn => fn());
    }

    public registerCommand(cmd: string, fn: CommandFunction, overwrite?: boolean): void {
        return register(this.commands, cmd, fn, overwrite);
    }

    public registerPreprocessor(cmd: string, fn: CommandFunction, overwrite?: boolean): void {
        return register(this.preprocessors, cmd, fn, overwrite);
    }

    public verifyArguments(types: Array<NodeType>, ...args: Array<Node>): ArgumentCheckResult {
        const invalidArguments = args
            .map((node, index) => ({expected: types[index], actual: node.type, index}))
            .filter(type => type.expected !== type.actual);
        return {ok: invalidArguments.length === 0, invalid: invalidArguments}
    }

    public parse(text: string): Array<Node> {
        return parser.parse(text).map(mergeText);
    }

    public registerPackage(pkg: Package): void {
        if (pkg.commands) {
            Object.keys(pkg.commands).forEach(name => this.registerCommand(name, pkg.commands[name]));
        }
        if (pkg.preprocessors) {
            Object.keys(pkg.preprocessors).forEach(name => this.registerPreprocessor(name, pkg.preprocessors[name]));
        }
        if (pkg.hooks) {
            if (pkg.hooks.prerender)
                this.on('prerender', pkg.hooks.prerender);
            if (pkg.hooks.postrender)
                this.on('postrender', pkg.hooks.postrender);
        }

        if (pkg.requires) {
            pkg.requires.forEach(req => {
                if (!this.registeredPackages.includes(req))
                    console.warn(`Package '${pkg.name}' requires '${req}' which has not been registered`);
            });
        }
        this.registeredPackages.push(pkg.name);
    }

    public async render(code: string, root: HTMLElement): Promise<void> {
        while (root.firstChild) root.removeChild(root.firstChild);
        let page = 0, currentPage: HTMLElement;
        const newPage = () => {
            root.appendChild(currentPage = this.htmlLite('section', {
                id: `page-${++page}`,
                class: 'sheet',
                'data-page': page
            }));
            currentPage.appendChild(this.htmlLite('div', {class: 'meta page-start'}));
        };
        newPage();
        const place = node => {
            currentPage.appendChild(node);
            if (currentPage.scrollHeight > currentPage.clientHeight) {
                newPage();
                currentPage.appendChild(node);
            }
        };
        Nxtx.trigger(this.hooks.prerender);
        let paragraphs = this.parse(code).map(mergeText);
        const preprocessed = await this.executePreprocessors(paragraphs);
        Nxtx.trigger(this.hooks.midrender);
        const rendered = await mapSeries(preprocessed, async (node: Node) => await this.baseRenderNode(node));
        rendered.forEach(nodes => nodes.forEach(place));
        Nxtx.trigger(this.hooks.postrender);
    }

    public text(content: string) {
        return document.createTextNode(content);
    }

    public htmlLite(nodeName: string, attributes: object, ...children: Array<HTMLElement | string>): HTMLElement {
        let n = document.createElement(nodeName);
        Object.keys(attributes || {}).forEach(k => n.setAttribute(k, attributes[k]));
        children.forEach(c => typeof c === "string" ? n.appendChild(this.text(c)) : n.appendChild(c));
        return n;
    }

    public async html(nodeName: string, attributes: { [key: string]: any }, ...children: Array<Promise<HTMLElement | Node | string> | HTMLElement | Node | string>): Promise<HTMLElement> {
        const n = this.htmlLite(nodeName, attributes);
        for (let i = 0; i < children.length; i++) n.appendChild(await this.baseRenderNode(children[i]));
        return n;
    }

    public on(event: RenderEvent, handler: () => void): void {
        if (!this.hooks[event].includes(handler)) this.hooks[event].push(handler);
    }

    public off(event: RenderEvent, handler: () => void): void {
        const index = this.hooks[event].indexOf(handler);
        if (index !== -1) this.hooks[event].splice(index, 1);
    }

    private baseRenderNode = async (node: Node | string | any) => {
        if (typeof node === 'string') return this.text(node);
        if (!node.type) return node;
        switch (node.type) {
            case NodeType.Node:
                return node;
            case NodeType.Paragraph:
                const pNodes = await flatMap(node.value, this.baseRenderNode);
                if (pNodes.length) pNodes.push(this.htmlLite('div', {class: 'meta paragraph-break'}));
                return pNodes;
            case NodeType.Html:
                return this.htmlLite('span', {innerHTML: node.value});
            case NodeType.Text:
                return document.createTextNode(node.value);
            case NodeType.Command:
                const result = [await this.executeCommand(node.name, node.args)].flat().filter(truthy);
                return await flatMap(result, this.baseRenderNode)
        }
        console.error('Unrecognized node', node);
    };

    private executeCommand = async (cmd: string, args: Array<Node>): Promise<CommandResult> => {
        if (this.commands[cmd] !== undefined)
            return await this.commands[cmd](...(await map(args, arg => arg.type === NodeType.Command ? this.executeCommand(arg.name, arg.args) : arg)));
        console.warn(`Command '${cmd}' not registered`);
        return await this.html('b', {class: "error"}, `${cmd}?`);
    };

    private executePreprocessor = async (node: Node): Promise<CommandResult | Node> => {
        if (node.type === NodeType.Command && this.preprocessors[node.name]) {
            const result = [await this.preprocessors[node.name](...node.args)].flat().filter(truthy);
            const childResults = await flatMap(result, this.executePreprocessor);
            if (this.commands[node.name] === undefined) return childResults;
        } else if (node.type === NodeType.Paragraph) {
            node.value = await flatMapFilter(node.value, this.executePreprocessor);
        }
        return node;
    };

    private executePreprocessors = async (paragraphs: Array<Node>): Promise<void> => await reduce(paragraphs, async (processed, current) => {
        const preprocessed = await flatMapFilter(current.value, this.executePreprocessor);
        processed.push(...flattenNodes(preprocessed));
        return processed;
    }, []);
}

export default new Nxtx();