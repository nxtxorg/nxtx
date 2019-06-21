/*  List of contents; Chapter, section etc. package for nxtx
    License: MIT */

let baseNumbering = {};
let numbering = {};
let parts = [];
let refs = {};

const registerPart = (type, element) => {
    baseNumbering[type] = 0;
    numbering = { ...baseNumbering };
    nxtx.registerCommand(type, content => {
        numbering[type] += 1;
        resetChildren(type);
        parts.push({ type, title: content.value, numbering: { ...numbering } });
        return nxtx.html(element, null, content.value);
    });
};

[   // Ordering matters
    ['chapter', 'h1'],
    ['section', 'h3'],
    ['subsection', 'h4'],
].map(arr => registerPart(...arr));

nxtx.registerCommand('label', ref => {
    refs[ref.value] = parts.length && parts[parts.length - 1];
    return nxtx.html('span', {id: '--' + ref.value, 'data-label': ref.value});
});

const resetChildren = type => {
    const types = Object.keys(numbering);
    let reset = false;
    for (let i = 0; i < types.length; i++) {
        if (reset) numbering[types[i]] = 0;
        else if (types[i] === type) reset = true;
    }
};
const capitalizeStr = str => str[0].toUpperCase() + str.substr(1);
const formatPart = (ref, capitalize) => {
    const part = refs[ref];
    if (!part) {
        console.warn(`Label '${ref}' has not been referenced`);
        return nxtx.html('b', { class: "warning" }, `${ref}`);
    }
    let result = '';
    switch (part.type) {
        case 'chapter':
            result = `chapter ${part.numbering.chapter}`;
            break;
        case 'section':
            result = `section ${part.numbering.chapter}.${part.numbering.section}`;
            break;
        case 'subsection':
            result = `section ${part.numbering.chapter}.${part.numbering.section}.${part.numbering.subsection}`;
            break;
    }
    return capitalize ? capitalizeStr(result) : result;
};
nxtx.registerCommand('ref', ref => {
    return nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatPart(ref.value, false));
});
nxtx.registerCommand('Ref', ref => {
    return nxtx.html('a', {href: `#--${ref.value}`, 'data-ref': ref.value}, formatPart(ref.value, true));
});

nxtx.on('postrender', () => {
    numbering = { ...baseNumbering };
    parts = [];
    refs = {};
});