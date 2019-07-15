/*  Basic styling package package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

const style = document.createElement("style");
style.id = 'styling-style-block';
document.head.appendChild(style);



const pkg = {
    name: 'styling',
    commands: {
        'add-css-rule': (rule, index = 1) => style.sheet.insertRule(rule.value, index),
        'set-root-style': (prop, ...values) => document.querySelector('.nxtx-root').style.setProperty(prop, values.map(e => e.value).join(', ')),
        'set-font-family': (...fontFamilies) => ({
            type: nxtx.TYPE.COMMAND,
            name: 'set-root-style',
            args: ['font-family', ...fontFamilies]
        }),
        'set-local-font-family': (fontName, fontUrl) => {

            const css = `@font-face { font-family: '${fontName.value}'; src: local('${fontName.value}'), url('${fontUrl.value}'); }`;

            return ([
                {
                    type: nxtx.TYPE.COMMAND,
                    name: 'add-css-root',
                    args: [ { type: nxtx.TYPE.TEXT, value: css} ]
                },
                {
                    type: nxtx.TYPE.COMMAND,
                    name: 'set-root-style',
                    args: ['font-family', fontName]
                }
            ]);
        },
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

            return { type: nxtx.TYPE.COMMAND, name: 'set-font-family', args: fontFamilies };
        }
    }
};

if (nxtx) {
    Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
}

export default pkg;