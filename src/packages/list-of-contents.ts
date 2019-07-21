/*  List of contents; Chapter, section etc. package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

import {CommandResult, Node, NodeType, Package, INxtx, CommandFunction} from '../nxtx-types';
declare const nxtx: INxtx;

let baseNumbering = {};
let numbering = {};
let parts = [];
let refs = {};

const style = document.createElement("style");
style.id = 'basic-formatting-style-block';
document.head.appendChild(style);
const sheet = <CSSStyleSheet> style.sheet;

const registerPart = (type:string, element:string) => {
    baseNumbering[type] = 0;
    numbering = { ...baseNumbering };
    const obj = { preprocessor: {}, command: {} };
    obj.preprocessor[type] = (content:Node) => {
        numbering[type] += 1;
        resetChildrenNumbering(type);
        parts.push({type, title: content.value, numbering: {...numbering}});
    };
    obj.command[type] = (content:Node) => nxtx.html(element, null, content.value);
    return obj;
};

const types = [
    ['chapter', 'h1'],
    ['section', 'h3'],
    ['subsection', 'h4'],
].map((arr:string[]) : { preprocessor, command } => registerPart(arr[0], arr[1]));

const preprocessors : {[name:string]:CommandFunction} = Object.assign({}, ...types.map(t => t.preprocessor));
const commands : {[name:string]:CommandFunction} = Object.assign({}, ...types.map(t => t.command));

const resetChildrenNumbering = type => {
    const types = Object.keys(numbering);
    let reset = false;
    for (let i = 0; i < types.length; i++) {
        if (reset) numbering[types[i]] = 0;
        else if (types[i] === type) reset = true;
    }
};
const capitalizeStr = str => str[0].toUpperCase() + str.substr(1);
const formatNumbering = numbering => Object.keys(numbering).map(k => numbering[k]).join('.').replace(/[.0]+$/, '');
const formatRef = (ref, capitalize) => {
    const part = refs[ref];
    if (!part) {
        console.warn(`Label '${ref}' has not been referenced`);
        return nxtx.html('b', { class: "warning" }, `${ref}`);
    }
    let result = '';
    switch (part.type) {
        case 'chapter':
            result = `chapter ${formatNumbering(part.numbering)}`;
            break;
        case 'section':
            result = `section ${formatNumbering(part.numbering)}`;
            break;
        case 'subsection':
            result = `section ${formatNumbering(part.numbering)}`;
            break;
    }
    return capitalize ? capitalizeStr(result) : result;
};

// Default
sheet.insertRule('.loc-chapter { font-size: 14pt }', 0);
sheet.insertRule('.loc-section { font-size: 13pt; padding-left: 2em }', 1);
sheet.insertRule('.loc-subsection { font-size: 12pt; padding-left: 4em }', 2);

const pkg : Package = {
    name: 'images',
    preprocessors: {
        'label': ref => {
            if (refs[ref.value] !== undefined) console.warn(`Attempt to redefine label '${ref.value}' ignored`);
            else refs[ref.value] = parts[parts.length - 1];
        },
        ...preprocessors
    },
    commands: {
        'label': ref => nxtx.html('span', {id: '--' + ref.value, 'data-label': ref.value}),
        'ref': ref => nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatRef(ref.value, false)),
        'Ref': ref => nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatRef(ref.value, true)),
        'loc-print': () => {
            const rendition = [
                nxtx.html('h2', { class: 'list-of-contents' }, 'List of Contents'),
                ...parts.map(part => nxtx.html('div', { class: `loc-${part.type}` }, `${formatNumbering(part.numbering)} ${part.title}`)),
                { type: NodeType.Command, name: 'pagebreak', args: [] }
            ];
            return rendition;
        },
        ...commands
    },
    hooks: {
        prerender: () => {
            numbering = { ...baseNumbering };
            parts = [];
            refs = {};
        }
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default nxtx;