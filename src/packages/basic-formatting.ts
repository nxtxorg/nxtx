/*  Basic text formatting package for NxTx
    Author: Malte Rosenbjerg
    License: MIT */

import { Package, INxtx } from '../nxtx-types';
declare const nxtx: INxtx;

const style = document.createElement("style");
style.id = 'basic-formatting-style-block';
document.head.appendChild(style);

// Default
const sheet = <CSSStyleSheet> style.sheet;
sheet.insertRule('.page-break { height: 0 }', 0);
sheet.insertRule('.meta ~ .page-break:not(:last-child) { height: 100% }', 1);
sheet.insertRule('.paragraph-break { height: 0 }', 2);
sheet.insertRule('.meta ~ .paragraph-break:not(:last-child) { height: 1.2em }', 3);

const pkg : Package = {
    name: 'basic-formatting',
    commands: {
        'text:it': content => nxtx.html('i', null, content.value),
        'text:bf': content => nxtx.html('b', null, content.value),
        'text:tt': content => nxtx.html('code', null, content.value),
        'dquote': contentNode => nxtx.text(`“${contentNode.value}”`),
        'break': () => nxtx.htmlLite('div', { class: 'meta', style: 'height: 1.5em' }),
        'pagebreak': () => nxtx.htmlLite('div', { class: 'meta page-break' }),
        'title': titleNode => (document.title = titleNode.value) && undefined,
        'ignore': () => undefined,

    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;