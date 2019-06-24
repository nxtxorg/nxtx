var nxtx_core = (function () {
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

    /*  Layout package for nxtx
        Author: Thomas Gwynfryn McCollin
        License: MIT */

    const style$1 = document.createElement("style");
    style$1.id = 'layout-style-block';
    document.head.appendChild(style$1);

    const parse = argNode => {
        console.log(argNode);
        if (argNode.type !== 'number') return argNode.value;
        return argNode.value + 'mm';
    };

    const replaceRule = (newRule, ruleIndex) => {
        if (style$1.sheet.deleteRule) style$1.sheet.deleteRule(ruleIndex);
        else if (style$1.sheet.removeRule) style$1.sheet.removeRule(ruleIndex);
        style$1.sheet.insertRule(newRule, ruleIndex);
    };

    const marginFormatters = {
        all: value => { replaceRule(`.sheet { padding: ${value} }`, 1); },
        left: value => { replaceRule(`.sheet { padding-left: ${value} }`, 1); },
        top: value => { replaceRule(`.sheet { padding-top: ${value} }`, 1); },
        right: value => { replaceRule(`.sheet { padding-right: ${value} }`, 1); },
        bottom: value => { replaceRule(`.sheet { padding-bottom: ${value} }`, 1); },
        vertical: value => { replaceRule(`.sheet { padding-top: ${value}; padding-bottom: ${value} }`, 1); },
        horizontal: value => { replaceRule(`.sheet { padding-left: ${value}; padding-right: ${value} }`, 1); },

        'head-separator': value => { style$1.sheet.insertRule(`header { margin-bottom: ${value}`, 2); },
        'foot-skip': value => { style$1.sheet.insertRule(`footer { margin-top: ${value}`, 3); },
    };

    // Default
    style$1.sheet.insertRule('@page { size: A4 }', 0);
    style$1.sheet.insertRule(`.sheet { padding: 2cm }`, 1);
    style$1.sheet.insertRule('header { height: 3cm }', 2);
    style$1.sheet.insertRule('footer { height: 3cm }', 3);

    const pkg$1 = {
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
        Object.keys(pkg$1.commands).forEach(name => nxtx.registerCommand(name, pkg$1.commands[name]));
        Object.keys(pkg$1.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg$1.preprocessors[name]));
    }

    /*  Package for loading documents and packages
        Author: Malte Rosenbjerg
        License: MIT */

    let loaded = {
        documents: {},
        packages: []
    };

    const pkg$2 = {
        name: 'loading',
        commands: {
            'load:document': async nameNode => {
                const name = nameNode.value.toString();
                const filename = (name.substr(name.length - 5).toLowerCase() !== '.nxtx') ? `${name}.nxtx` : name;
                const response = await fetch(filename);
                if (!response.ok) return console.error(`NxTx document ${filename} not found`);

                const lastModified = response.headers.get('last-modified');
                const cached = loaded.documents[filename];
                if (lastModified && cached && cached.lastModified === lastModified) {
                    console.log('using cached', filename);
                    return loaded.documents[filename].nodes;
                }

                const content = await response.text();
                const nodes = nxtx.parse(content);
                if (lastModified) {
                    loaded.documents[filename] = {lastModified, nodes};
                }
                return nodes;
            }
        },
        preprocessors: {
            'load:package': srcNode => new Promise((acc, rej) => {
                if (loaded.packages[srcNode.value])
                    return acc();
                loaded.packages[srcNode.value] = true;
                const script = document.createElement('script');
                script.src = srcNode.value;
                script.async = true;
                script.onreadystatechange = script.onload = () => {
                    if (!acc.done && (!script.readyState || /loaded|complete/.test(script.readyState))) {
                        acc.done = true;
                        acc();
                    }
                };
                document.head.appendChild(script);
            })
        }
    };

    if (nxtx) {
        Object.keys(pkg$2.commands).forEach(name => nxtx.registerCommand(name, pkg$2.commands[name]));
        Object.keys(pkg$2.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg$2.preprocessors[name]));
    }

    /*  Basic styling package package for nxtx
        Author: Malte Rosenbjerg
        License: MIT */

    const style$2 = document.createElement("style");
    style$2.id = 'styling-style-block';
    document.head.appendChild(style$2);



    const pkg$3 = {
        name: 'styling',
        commands: {
            'add-css-rule': (rule, index = 1) => style$2.sheet.insertRule(rule.value, index),
            'set-root-style': (prop, ...values) => document.querySelector('.nxtx-root').style.setProperty(prop, values.map(e => e.value).join(', ')),
            'set-font-family': (...fontFamilies) => ({
                type: 'command',
                name: 'set-root-style',
                args: ['font-family', ...fontFamilies]
            }),
            'set-google-font-family': async (...fontFamilies) => {
                const attr = {
                    rel: 'stylesheet',
                    href: `https://fonts.googleapis.com/css?family=${fontFamilies[0].value}&display=swap`,
                    id: 'link-gfont-' + fontFamilies[0].value
                };
                if (!document.getElementById(attr.id)) {
                    const link = await nxtx.html('link', attr);
                    document.head.appendChild(link);
                }

                return { type: 'command', name: 'set-font-family', args: fontFamilies };
            }
        }
    };

    if (nxtx) {
        Object.keys(pkg$3.commands).forEach(name => nxtx.registerCommand(name, pkg$3.commands[name]));
    }

    var core = {
        formatting: pkg,
        layout: pkg$1,
        loading: pkg$2,
        styling: pkg$3
    };

    return core;

}());
//# sourceMappingURL=core.js.map
