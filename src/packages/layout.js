/*  Layout package for nxtx
    Author: Thomas Gwynfryn McCollin
    License: MIT */

const style = document.createElement("style");
style.id = 'layout-style-block';
document.head.appendChild(style);

const parse = argNode => {
    console.log(argNode);
    if (argNode.type !== nxtx.TYPES.NUMBER) return argNode.value;
    return argNode.value + 'mm';
};

const replaceRule = (newRule, ruleIndex) => {
    if (style.sheet.deleteRule) style.sheet.deleteRule(ruleIndex);
    else if (style.sheet.removeRule) style.sheet.removeRule(ruleIndex);
    style.sheet.insertRule(newRule, ruleIndex);
};

const marginFormatters = {
    all: value => { replaceRule(`.sheet { padding: ${value} }`, 1) },
    left: value => { replaceRule(`.sheet { padding-left: ${value} }`, 1) },
    top: value => { replaceRule(`.sheet { padding-top: ${value} }`, 1) },
    right: value => { replaceRule(`.sheet { padding-right: ${value} }`, 1) },
    bottom: value => { replaceRule(`.sheet { padding-bottom: ${value} }`, 1) },
    vertical: value => { replaceRule(`.sheet { padding-top: ${value}; padding-bottom: ${value} }`, 1) },
    horizontal: value => { replaceRule(`.sheet { padding-left: ${value}; padding-right: ${value} }`, 1) },

    'head-separator': value => { style.sheet.insertRule(`header { margin-bottom: ${value}`, 2) },
    'foot-skip': value => { style.sheet.insertRule(`footer { margin-top: ${value}`, 3) },
};

// Default
style.sheet.insertRule('@page { size: A4 }', 0);
style.sheet.insertRule(`.sheet { padding: 2cm }`, 1);
style.sheet.insertRule('header { height: 3cm }', 2);
style.sheet.insertRule('footer { height: 3cm }', 3);

const pkg = {
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

if (nxtx) {
    Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
    Object.keys(pkg.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg.preprocessors[name]));
}

export default pkg;