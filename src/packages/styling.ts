/*  Basic styling package package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

import {NodeType, INxtx, Package} from '../nxtx-types';

declare const nxtx: INxtx;

const style = document.createElement("style");
style.id = 'styling-style-block';
document.head.appendChild(style);
const sheet = <CSSStyleSheet> style.sheet;

const pkg : Package = {
    name: 'styling',
    commands: {
        'add-css-rule': (rule, index = { type: NodeType.Number, value: 1 }) => sheet.insertRule(rule.value, index.value) && undefined,
        'set-root-style': (prop, ...values) => (<HTMLElement>document.querySelector('.nxtx-root')).style.setProperty(prop.value, values.map(e => e.value).join(', ')),
        'set-font-family': (...fontFamilies) => ({
            type: NodeType.Command,
            name: 'set-root-style',
            args: [{ type: NodeType.String, value: 'font-family' }, ...fontFamilies]
        }),
        'set-local-font-family': (fontName, fontUrl) => {
            const css = `@font-face { font-family: '${fontName.value}'; src: local('${fontName.value}'), url('${fontUrl.value}'); }`;
            return ([
                {
                    type: NodeType.Command,
                    name: 'add-css-root',
                    args: [ { type: NodeType.Text, value: css} ]
                },
                {
                    type: NodeType.Command,
                    name: 'set-root-style',
                    args: [{ type: NodeType.String, value: 'font-family' }, fontName]
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

            return { type: NodeType.Command, name: 'set-font-family', args: fontFamilies };
        }
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;