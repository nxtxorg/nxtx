(function () {
    'use strict';

    /*  Acronym package for nxtx
        requires:
        - basic-formatting (newpage)
        License: MIT */

    const acronyms = {};
    let usedAcronyms = [];

    nxtx.registerCommand('define-ac', (acronym, full) => {
        acronyms[acronym.value] = full.value;
    });
    nxtx.registerCommand('ac', acronym => {
        const full = acronyms[acronym.value];
        if (!full) {
            console.warn(`Acronym '${acronym.value}' not defined`);
            return nxtx.html('b', { class: "warning" }, `${acronym.value}!`);
        }
        if (usedAcronyms.includes(acronym.value))
            return acronym.value;
        usedAcronyms.push(acronym.value);
        return full;
    });

    nxtx.on('prerender', () => usedAcronyms = []);

}());
//# sourceMappingURL=acronyms.js.map
