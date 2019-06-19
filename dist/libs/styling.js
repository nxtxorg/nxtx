(function () {
    'use strict';

    /*  Basic styling package package for nxtx
        License: MIT */

    const style = document.createElement("style");
    document.head.appendChild(style);

    nxtx.registerCommand('add-css-rule', (rule, index = 1) => {
        style.sheet.insertRule(rule.value, index);
    });

    nxtx.registerCommand('set-root-style', (prop, ...values) => {
        document.querySelector('.nxtx-root').style.setProperty(prop, values.map(e => e.value).join(', '));
    });

    nxtx.registerCommand('set-font-family', (...fontFamilies) => {
        return { type: 'command', name: 'set-root-style', args: ['font-family', ...fontFamilies] };
    });

    nxtx.registerCommand('set-google-font-family', async (...fontFamilies) => {
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
    });

}());
//# sourceMappingURL=styling.js.map
