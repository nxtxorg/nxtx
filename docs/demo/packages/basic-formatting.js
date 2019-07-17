var nxtx_basic_formatting = (function () {
    'use strict';

    var style = document.createElement("style");
    style.id = 'basic-formatting-style-block';
    document.head.appendChild(style);
    var sheet = style.sheet;
    sheet.insertRule('.page-break { height: 0 }', 0);
    sheet.insertRule('.meta ~ .page-break:not(:last-child) { height: 100% }', 1);
    sheet.insertRule('.paragraph-break { height: 0 }', 2);
    sheet.insertRule('.meta ~ .paragraph-break:not(:last-child) { height: 1.2em }', 3);
    var pkg = {
        name: 'basic-formatting',
        commands: {
            'text:it': function (content) { return nxtx.html('i', null, content.value); },
            'text:bf': function (content) { return nxtx.html('b', null, content.value); },
            'text:tt': function (content) { return nxtx.html('code', null, content.value); },
            'dquote': function (contentNode) { return nxtx.text("\u201C" + contentNode.value + "\u201D"); },
            'break': function () { return nxtx.htmlLite('div', { class: 'meta', style: 'height: 1.5em' }); },
            'pagebreak': function () { return nxtx.htmlLite('div', { class: 'meta page-break' }); },
            'title': function (titleNode) { return (document.title = titleNode.value) && undefined; },
            'ignore': function () { return undefined; },
        }
    };
    if (nxtx) {
        Object.keys(pkg.commands).forEach(function (name) { return nxtx.registerCommand(name, pkg.commands[name]); });
    }

    return pkg;

}());
//# sourceMappingURL=basic-formatting.js.map
