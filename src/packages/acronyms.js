/*  Acronym package for nxtx
    requires:
    - basic-formatting (newpage)
    Author: Malte Rosenbjerg
    License: MIT */

let acronyms = {};
let usedAcronyms = [];

const pkg = {
    name: 'acronyms',
    requires: [ 'basic-formatting' ],
    commands: {
        'define-ac': (acronym, full) => (acronyms[acronym.value] = full.value) && false,
        'ac': acronym => {
            const full = acronyms[acronym.value];
            if (!full) {
                console.warn(`Acronym '${acronym.value}' not defined`);
                return nxtx.html('b', { class: "warning" }, `${acronym.value}!`);
            }
            if (usedAcronyms.includes(acronym.value))
                return acronym.value;
            usedAcronyms.push(acronym.value);
            return `${full} (${acronym.value})`;
        }
    },
    hooks: {
        prerender: () => {
            acronyms = {};
            usedAcronyms = [];
        }
    }
};

if (nxtx) {
    Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
    nxtx.on('prerender', pkg.hooks.prerender);
}

export default pkg;

