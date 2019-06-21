import parser from '../grammar.pegjs';

const commands = {};
const executeCommand = async (cmd, args) => {
    if (commands[cmd] !== undefined)
        return await commands[cmd](...args);
    console.warn(`Command '${cmd}' not registered`);
    return await html('b', {class: "error"}, `${cmd}?`);
};
export const registerCommand = (cmd, fn, overwrite) => {
    if (!overwrite && commands[cmd] !== undefined)
        return console.warn(`Command '${cmd}' is already registered. Set overwrite to true, if you need to overwrite the already registered command.`);
    commands[cmd] = fn;
};

const noMerge = { '.': true, ',': true };
const mergeText = pNode => {
    const textNodes = [];
    const mergedNodes = pNode.value.reduce((acc, node) => {
        if (node.type === 'text') {
            if (noMerge[node.value[0]]) {
                acc.push({ type: 'text', value: node.value[0] + ' ' });
                if (node.value.length !== 1) textNodes.push({ type: 'text', value: node.value.substr(1) });
            }
            else textNodes.push(node);
        } else {
            if (textNodes.length) {
                acc.push({ type: 'text', value: textNodes.map(n => n.value).join(' ') });
                textNodes.length = 0;
            }
            acc.push(node);
        }
        return acc;
    }, []);
    if (textNodes.length)
        mergedNodes.push({ type: 'text', value: textNodes.map(n => n.value).join(' ') });
    return { type: pNode.type, value: mergedNodes };
};

export const parse = text => parser.parse(text).map(mergeText);

const truthy = e => !!e;

const asyncFlatMap = async (elements, fn) => (await Promise.all(elements.map(fn))).flat();

const baseRenderNode = async node => {
    if (node.split) return document.createTextNode(node);
    if (!node.type) return node;
    switch (node.type) {
        case 'node':
            return node;
        case 'block':
            return await asyncFlatMap(node.value, baseRenderNode);
        case 'paragraph':
            const pNodes = await asyncFlatMap(node.value, baseRenderNode);
            if (pNodes.length) pNodes.push(htmlLite('div', { class: 'paragraph-break' }));
            return pNodes;
        case 'html':
            return htmlLite('span', { innerHTML: node.value });
        case 'text':
            return document.createTextNode(node.value);
        case 'command':
            const result = [ await executeCommand(node.name, node.args) ].flat().filter(truthy);
            return await asyncFlatMap(result, baseRenderNode);
    }
    console.error(node);
};

export const render = async (text, root) => {
    while (root.firstChild) root.removeChild(root.firstChild);
    trigger('prerender');
    let page = 0, currentPage;
    const newPage = () => root.appendChild(currentPage = htmlLite('section', { id: `page-${++page}`, class: 'sheet', 'data-page': page }));
    newPage();
    const place = node => {
        currentPage.appendChild(node);
        if (currentPage.scrollHeight > currentPage.clientHeight) {
            newPage();
            currentPage.appendChild(node);
        }
    };
    const paragraphs = parse(text);
    for (let i = 0; i < paragraphs.length; i++) {
        const children = await baseRenderNode(paragraphs[i]);
        children.forEach(place);
    }
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

const hooks = {
    prerender: [],
    postrender: []
};
const trigger = event => (hooks[event] || []).forEach(fn => fn());
export const on = (event, handler) => {
    if (!hooks[event].includes(handler)) hooks[event].push(handler);
};
export const off = (event, handler) => {
    const index = hooks[event].indexOf(handler);
    if (index !== -1) hooks[event].splice(index, 1);
};