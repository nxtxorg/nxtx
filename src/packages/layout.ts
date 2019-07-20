/*  Layout package for nxtx
    Author: Thomas Gwynfryn McCollin
    License: MIT */

import {NodeType, Package, Nxtx} from '../nxtx-types';
declare const nxtx: Nxtx;

const style = document.createElement("style");
style.id = 'layout-style-block';
document.head.appendChild(style);
const sheet = <CSSStyleSheet> style.sheet;

const parse = argNode => {
    if (argNode.type !== NodeType.Number) return argNode.value;
    return argNode.value + 'mm';
};

const replaceRule = (newRule, ruleIndex)=> {
    if (sheet.deleteRule) sheet.deleteRule(ruleIndex);
    else if (sheet.removeRule) sheet.removeRule(ruleIndex);
    sheet.insertRule(newRule, ruleIndex);
};

const marginFormatters = {
    all: value => { replaceRule(`.sheet { padding: ${value} }`, 1) },
    left: value => { replaceRule(`.sheet { padding-left: ${value} }`, 1) },
    top: value => { replaceRule(`.sheet { padding-top: ${value} }`, 1) },
    right: value => { replaceRule(`.sheet { padding-right: ${value} }`, 1) },
    bottom: value => { replaceRule(`.sheet { padding-bottom: ${value} }`, 1) },
    vertical: value => { replaceRule(`.sheet { padding-top: ${value}; padding-bottom: ${value} }`, 1) },
    horizontal: value => { replaceRule(`.sheet { padding-left: ${value}; padding-right: ${value} }`, 1) },

    'head-separator': value => { sheet.insertRule(`header { margin-bottom: ${value}`, 2) },
    'foot-skip': value => { sheet.insertRule(`footer { margin-top: ${value}`, 3) },
};

// Default
sheet.insertRule('@page { size: A4 }', 0);
sheet.insertRule(`.sheet { padding: 2cm }`, 1);
sheet.insertRule('header { height: 3cm }', 2);
sheet.insertRule('footer { height: 3cm }', 3);

const pkg : Package = {
    name: 'layout',
    commands: {
        'set-paper-size': paperSizeNode => replaceRule(`@page { size: ${paperSizeNode} }`, 0),
        'set-header': heightNode => replaceRule(`header {height: ${heightNode}mm`, 2),
        'set-footer': heightNode => replaceRule(`footer {height: ${heightNode}mm`, 3)
    },
    preprocessors: {
        'set-margin': dictNode => Object.keys(dictNode.value).forEach(key => marginFormatters[key](parse(dictNode.value[key])))
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;