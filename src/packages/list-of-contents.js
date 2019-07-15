/*  List of contents; Chapter, section etc. package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

let baseNumbering = {};
let numbering = {};
let parts = [];
let refs = {};

const style = document.createElement("style");
style.id = 'basic-formatting-style-block';
document.head.appendChild(style);

const registerPart = (type, element) => {
    baseNumbering[type] = 0;
    numbering = { ...baseNumbering };
    nxtx.registerPreprocessor(type, content => {
        numbering[type] += 1;
        resetChildrenNumbering(type);
        parts.push({ type, title: content.value, numbering: { ...numbering } });
    });
    nxtx.registerCommand(type, content => nxtx.html(element, null, content.value));
};

[   // Ordering matters
    ['chapter', 'h1'],
    ['section', 'h3'],
    ['subsection', 'h4'],
].forEach(arr => registerPart(...arr));

nxtx.registerPreprocessor('label', ref => {
    if (refs[ref.value] !== undefined) console.warn(`Attempt to redefine label '${ref.value}' ignored`);
    else refs[ref.value] = parts[parts.length - 1];
});
nxtx.registerCommand('label', ref => {
    return nxtx.html('span', {id: '--' + ref.value, 'data-label': ref.value});
});

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
nxtx.registerCommand('ref', ref => {
    return nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatRef(ref.value, false));
});
nxtx.registerCommand('Ref', ref => {
    return nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatRef(ref.value, true));
});



nxtx.registerCommand('loc-print', () => {
    const rendition = [
        nxtx.html('h2', { class: 'list-of-contents' }, 'List of Contents'),
        ...parts.map(part => nxtx.html('div', { class: `loc-${part.type}` }, `${formatNumbering(part.numbering)} ${part.title}`)),
        { type: nxtx.TYPE.COMMAND, name: 'pagebreak', args: [] }
    ];
    return rendition;
});

nxtx.on('prerender', () => {
    numbering = { ...baseNumbering };
    parts = [];
    refs = {};
});

// Default
style.sheet.insertRule('.loc-chapter { font-size: 14pt }', 0);
style.sheet.insertRule('.loc-section { font-size: 13pt; padding-left: 2em }', 1);
style.sheet.insertRule('.loc-subsection { font-size: 12pt; padding-left: 4em }', 2);