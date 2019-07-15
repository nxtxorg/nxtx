/*  NxTx parser and renderer
    Author: Malte Rosenbjerg
    License: MIT */

import parser from '../grammar.pegjs';
import map from 'awaity/map';
import mapSeries from 'awaity/mapSeries';
import reduce from 'awaity/reduce';

export const TYPE = {
    PARAGRAPH: 1,
    COMMAND: 2,
    TEXT: 3,
    BLOCK: 4,
    HTML: 5,
    NODE: 6,

    DICTIONARY: 11,
    ARRAY: 12,
    NUMBER: 13,
    STRING: 14,
};

const commands = {};
const preprocessors = {};
const executeCommand = async (cmd, args) => {
    if (commands[cmd] !== undefined)
        return await commands[cmd](...(await map(args, arg => arg.type === TYPE.COMMAND ? executeCommand(arg.name, arg.args) : arg)));
    console.warn(`Command '${cmd}' not registered`);
    return await html('b', {class: "error"}, `${cmd}?`);
};

const register = (cmdCollection, cmd, fn, overwrite = false) => {
    if (!overwrite && cmdCollection[cmd] !== undefined)
        return console.warn(`Command '${cmd}' is already registered. Set overwrite to true, if you need to overwrite the already registered command.`);
    cmdCollection[cmd] = fn;
};
/**
 * Registers a command
 * @param {string} cmd The name of the command.
 * @param {Function} fn The command function.
 * @param {boolean} overwrite Whether to overwrite existing command.
 */
export const registerCommand = (cmd, fn, overwrite = false) => register(commands, cmd, fn, overwrite);
/**
 * Registers a preprocessor
 * @param {string} cmd The name of the preprocessor.
 * @param {Function} fn The preprocessor function.
 * @param {boolean} overwrite Whether to overwrite existing command.
 */
export const registerPreprocessor = (cmd, fn, overwrite = false) => register(preprocessors, cmd, fn, overwrite);
/**
 * Verifies this argument types
 * @param {Array<NxTxType>} cmd The name of the preprocessor.
 * @param {Function} fn The preprocessor function.
 * @param {boolean} overwrite Whether to overwrite existing command.
 */
export const verifyTypes = (types, ...args) => {
    const invalidTypes = args
        .map((actual, index) => ({expected: types[index], actual, index}))
        .filter(type => type.expected !== type.actual);
    return { ok: invalidTypes.length === 0, invalid: invalidTypes }
};
export const parse = text => parser.parse(text).map(mergeText);

const noMerge = { '.': true, ',': true };
const mergeText = paragraph => {
    const textNodes = [];
    const mergedNodes = paragraph.value.reduce((acc, node) => {
        if (node.type === TYPE.TEXT) {
            if (noMerge[node.value[0]]) {
                acc.push({ type: TYPE.TEXT, value: node.value[0] + ' ' });
                if (node.value.length !== 1) textNodes.push({ type: TYPE.TEXT, value: node.value.substr(1) });
            }
            else textNodes.push(node);
        } else {
            if (textNodes.length) {
                acc.push({ type: TYPE.TEXT, value: textNodes.map(n => n.value).join(' ') });
                textNodes.length = 0;
            }
            acc.push(node);
        }
        return acc;
    }, []);
    if (textNodes.length)
        mergedNodes.push({ type: TYPE.TEXT, value: textNodes.map(n => n.value).join(' ') });
    return { type: paragraph.type, value: mergedNodes };
};

const truthy = e => !!e;
const flatMap = async (elements, fn) => (await map(elements, fn)).flat();
const flatMapFilter = async (elements, fn) => (await map(elements, fn)).flat().filter(truthy);

const baseRenderNode = async node => {
    if (node.split) return document.createTextNode(node);
    if (!node.type) return node;
    switch (node.type) {
        case TYPE.NODE:
            return node;
        case TYPE.PARAGRAPH:
            const pNodes = await flatMap(node.value, baseRenderNode);
            if (pNodes.length) pNodes.push(htmlLite('div', { class: 'meta paragraph-break' }));
            return pNodes;
        case TYPE.HTML:
            return htmlLite('span', { innerHTML: node.value });
        case TYPE.TEXT:
            return document.createTextNode(node.value);
        case TYPE.COMMAND:
            const result = [ await executeCommand(node.name, node.args) ].flat().filter(truthy);
            return await flatMap(result, baseRenderNode)
    }
    console.error(node);
};
const flatten = nodes => {
    let cleanParagraph;
    let requiresNew = true;

    return nodes.reduce((flattened, current) => {
        if (current.type === TYPE.PARAGRAPH) requiresNew = flattened.push(...flatten(current.value)) && true;
        else {
            if (requiresNew) requiresNew = flattened.push(cleanParagraph = {type: TYPE.PARAGRAPH, value: []}) && false;
            cleanParagraph.value.push(current);
        }
        return flattened;
    }, []).flat();
};

const executePreprocessor = async node => {
    if (node.type === TYPE.COMMAND && preprocessors[node.name]) {
        const result = [ await preprocessors[node.name](...node.args) ].flat().filter(truthy);
        const childResults = await flatMap(result, executePreprocessor);
        if (commands[node.name] === undefined) return childResults;
    }
    else if (node.type === TYPE.PARAGRAPH) {
        node.value = await flatMapFilter(node.value, executePreprocessor);
    }
    return node;
};
const executePreprocessors = async paragraphs => {
    return await reduce(paragraphs, async (processed, current) => {
        const preprocessed = await flatMapFilter(current.value, executePreprocessor);
        processed.push(...flatten(preprocessed));
        return processed;
    }, []);
};

export const render = async (text, root) => {
    while (root.firstChild) root.removeChild(root.firstChild);
    let page = 0, currentPage;
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
    const rendered = await mapSeries(preprocessed, async node => await baseRenderNode(node));
    rendered.forEach(nodes => nodes.forEach(place));
    trigger('postrender');
};
export const htmlLite = (nodeName, attributes) => {
    let n = document.createElement(nodeName);
    Object.keys(attributes || {}).forEach(k => n.setAttribute(k, attributes[k]));
    return n;
};
export const html = async (nodeName, attributes, ...children) => {
    const n = htmlLite(nodeName, attributes);
    for (let i = 0; i < children.length; i++) n.appendChild(await baseRenderNode(children[i]));
    return n;
};

const hooks = { prerender: [], postrender: [] };
const trigger = event => (hooks[event] || []).forEach(fn => fn());
export const on = (event, handler) => {
    if (!hooks[event].includes(handler)) hooks[event].push(handler);
};
export const off = (event, handler) => {
    const index = hooks[event].indexOf(handler);
    if (index !== -1) hooks[event].splice(index, 1);
};