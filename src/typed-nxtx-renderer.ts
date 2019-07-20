/*  NxTx parser and renderer
    Author: Malte Rosenbjerg
    License: MIT */

import parser from './typed-nxtx-parser';
import map from 'awaity/map';
import mapSeries from 'awaity/mapSeries';
import reduce from 'awaity/reduce';
import {Node, NodeType, TypeCheck, CommandFunction, CommandResult, Package, Nxtx} from "./nxtx-types";
import pkg from "./packages/bibliography";

const commands : { [key:string]:CommandFunction } = {};
const preprocessors : { [key:string]:CommandFunction } = {};
const executeCommand = async (cmd:string, args:Array<Node>) : Promise<CommandResult> => {
    if (commands[cmd] !== undefined)
        return await commands[cmd](...(await map(args, arg => arg.type === NodeType.Command ? executeCommand(arg.name, arg.args) : arg)));
    console.warn(`Command '${cmd}' not registered`);
    return await html('b', {class: "error"}, `${cmd}?`);
};

const register = (cmdCollection:object, cmd:string, fn: CommandFunction, overwrite:boolean = false) : void => {
    if (!overwrite && cmdCollection[cmd] !== undefined)
        return console.warn(`Command '${cmd}' is already registered. Set overwrite to true, if you need to overwrite the already registered command.`);
    cmdCollection[cmd] = fn;
};

const registerCommand = (cmd:string, fn:CommandFunction, overwrite?:boolean) : void => register(commands, cmd, fn, overwrite);

const registerPreprocessor = (cmd:string, fn:CommandFunction, overwrite?:boolean) : void => register(preprocessors, cmd, fn, overwrite);

const verifyArguments = (types:Array<NodeType>, ...args:Array<Node>) : TypeCheck => {
    const invalidArguments = args
        .map((actual:Node, index:number) => ({expected: types[index], actual: actual.type, index}))
        .filter(type => type.expected !== type.actual);
    return { ok: invalidArguments.length === 0, invalid: invalidArguments }
};
const parse = (text:string) : Array<Node> => parser.parse(text).map(mergeText);

const registeredPackages = [];
const registerPackage = (pkg:Package) => {
    if (pkg.commands) {
        Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
    }
    if (pkg.preprocessors) {
        Object.keys(pkg.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg.preprocessors[name]));
    }
    if (pkg.hooks) {
        if (pkg.hooks.prerender)
            on('prerender', pkg.hooks.prerender);
        if (pkg.hooks.postrender)
            on('postrender', pkg.hooks.postrender);
    }

    if (pkg.requires) {
        pkg.requires.forEach(req => {
            if (!registeredPackages.includes(req))
                console.warn(`Package '${pkg.name}' requires '${req}' which has not been registered`);
        });
    }
    registeredPackages.push(pkg.name);
};


const noMerge = { '.': true, ',': true };
const mergeText = (paragraph:Node) : Node => {
    const textNodes = [];
    const mergedNodes = paragraph.value.reduce((acc, node) => {
        if (node.type === NodeType.Text) {
            if (noMerge[node.value[0]]) {
                acc.push({ type: NodeType.Text, value: node.value[0] + ' ' });
                if (node.value.length !== 1) textNodes.push({ type: NodeType.Text, value: node.value.substr(1) });
            }
            else textNodes.push(node);
        } else {
            if (textNodes.length) {
                acc.push({ type: NodeType.Text, value: textNodes.map(n => n.value).join(' ') });
                textNodes.length = 0;
            }
            acc.push(node);
        }
        return acc;
    }, []);
    if (textNodes.length)
        mergedNodes.push({ type: NodeType.Text, value: textNodes.map(n => n.value).join(' ') });
    return { type: paragraph.type, value: mergedNodes };
};

const truthy = e => !!e;

const flatMap = async (elements:Array<any>, fn:Function) : Promise<Array<any>> => (await map(elements, fn)).flat();
const flatMapFilter = async (elements:Array<any>, fn:Function) : Promise<Array<any>> => (await map(elements, fn)).flat().filter(truthy);

const baseRenderNode = async (node:Node|string|any) => {
    if (typeof node === 'string') return text(node);
    if (!node.type) return node;
    switch (node.type) {
        case NodeType.Node:
            return node;
        case NodeType.Paragraph:
            const pNodes = await flatMap(node.value, baseRenderNode);
            if (pNodes.length) pNodes.push(htmlLite('div', { class: 'meta paragraph-break' }));
            return pNodes;
        case NodeType.Html:
            return htmlLite('span', { innerHTML: node.value });
        case NodeType.Text:
            return document.createTextNode(node.value);
        case NodeType.Command:
            // @ts-ignore
            const result = [ await executeCommand(node.name, node.args) ].flat().filter(truthy);
            return await flatMap(result, baseRenderNode)
    }
    console.error(node);
};
const flattenNodes = (nodes:Array<Node>) : Array<Node> => {
    let cleanParagraph;
    let requiresNew = true;

    return nodes.reduce((flattened, current) => {
        if (current.type === NodeType.Paragraph) requiresNew = flattened.push(...flattenNodes(current.value)) && true;
        else {
            if (requiresNew) requiresNew = flattened.push(cleanParagraph = {type: NodeType.Paragraph, value: []}) && false;
            cleanParagraph.value.push(current);
        }
        return flattened;
        // @ts-ignore
    }, []).flat();
};

const executePreprocessor = async (node:Node) : Promise<CommandResult|Node> => {
    if (node.type === NodeType.Command && preprocessors[node.name]) {
        // @ts-ignore
        const result = [ await preprocessors[node.name](...node.args) ].flat().filter(truthy);
        const childResults = await flatMap(result, executePreprocessor);
        if (commands[node.name] === undefined) return childResults;
    }
    else if (node.type === NodeType.Paragraph) {
        node.value = await flatMapFilter(node.value, executePreprocessor);
    }
    return node;
};
const executePreprocessors = async (paragraphs:Array<Node>) => {
    return await reduce(paragraphs, async (processed, current) => {
        const preprocessed = await flatMapFilter(current.value, executePreprocessor);
        processed.push(...flattenNodes(preprocessed));
        return processed;
    }, []);
};

const render = async (text:string, root:HTMLElement) : Promise<void> => {
    while (root.firstChild) root.removeChild(root.firstChild);
    let page = 0, currentPage : HTMLElement;
    const newPage = () => {
        root.appendChild(currentPage = htmlLite('section', { id: `page-${++page}`, class: 'sheet', 'data-page': page }));
        currentPage.appendChild(htmlLite('div', { class: 'meta page-start' }));
    };
    newPage();
    const place = node => {
        currentPage.appendChild(node);
        if (currentPage.scrollHeight > currentPage.clientHeight) {
            newPage();
            currentPage.appendChild(node);
        }
    };
    trigger('prerender');
    let paragraphs = parse(text).map(mergeText);
    const preprocessed = await executePreprocessors(paragraphs);
    const rendered = await mapSeries(preprocessed, async (node:Node) => await baseRenderNode(node));
    rendered.forEach(nodes => nodes.forEach(place));
    trigger('postrender');
};
const text = (content:string) : Text => {
    return document.createTextNode(content);
};
const htmlLite = (nodeName:string, attributes:object) : HTMLElement => {
    let n = document.createElement(nodeName);
    Object.keys(attributes || {}).forEach(k => n.setAttribute(k, attributes[k]));
    return n;
};


const html = async (nodeName:string, attributes:object, ...children:Array<Promise<HTMLElement|Node|string>|HTMLElement|Node|string>) : Promise<HTMLElement> => {
    const n = htmlLite(nodeName, attributes);
    for (let i = 0; i < children.length; i++) n.appendChild(await baseRenderNode(children[i]));
    return n;
};

const hooks = { prerender: [], postrender: [] };
const trigger = (event:string) : void => (hooks[event] || []).forEach(fn => fn());
const on = (event:string, handler:Function) : void => {
    if (!hooks[event].includes(handler)) hooks[event].push(handler);
};
const off = (event:string, handler:Function) : void => {
    const index = hooks[event].indexOf(handler);
    if (index !== -1) hooks[event].splice(index, 1);
};

const nxtx : Nxtx = {
    registerCommand,
    registerPreprocessor,
    verifyArguments,
    registerPackage,
    parse,
    render,
    text,
    htmlLite,
    html,
    off,
    on
};
export default nxtx;