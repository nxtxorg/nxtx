var nxtx_basic_formatting = (function () {
    'use strict';

    /*  Basic text formatting package for NxTx
        Author: Malte Rosenbjerg
        License: MIT */
    const style = document.createElement("style");
    style.id = 'basic-formatting-style-block';
    document.head.appendChild(style);

    // Default
    style.sheet.insertRule('.page-break { height: 0 }', 0);
    style.sheet.insertRule('.meta ~ .page-break:not(:last-child) { height: 100% }', 1);
    style.sheet.insertRule('.paragraph-break { height: 0 }', 2);
    style.sheet.insertRule('.meta ~ .paragraph-break:not(:last-child) { height: 1.2em }', 3);

    const pkg = {
        name: 'basic-formatting',
        commands: {
            'text:it': content => nxtx.html('i', null, content.value),
            'text:bf': content => nxtx.html('b', null, content.value),
            'text:tt': content => nxtx.html('b', null, content.value),
            'dquote': contentNode => `“${contentNode.value}”`,
            'break': () => nxtx.htmlLite('div', { class: 'meta', style: 'height: 1.5em' }),
            'pagebreak': () => nxtx.htmlLite('div', { class: 'meta page-break' }),
            'title': titleNode => (document.title = titleNode.value) && false
        }
    };

    if (nxtx) {
        Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
    }

    return pkg;

}());
//# sourceMappingURL=basic-formatting.js.map
