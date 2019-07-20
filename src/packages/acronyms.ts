/*  Acronym package for nxtx
    requires:
    - basic-formatting (newpage)
    Author: Malte Rosenbjerg
    License: MIT */

import { Package, Nxtx } from '../nxtx-types';
declare const nxtx: Nxtx;

let acronyms = {};
let usedAcronyms = [];

const pkg : Package = {
    name: 'acronyms',
    requires: [ 'basic-formatting' ],
    commands: {
        'define-ac': (acronym, full) => (acronyms[acronym.value] = full.value) && undefined,
        'ac': acronym => {
            const full = acronyms[acronym.value];
            if (!full) {
                console.warn(`Acronym '${acronym.value}' not defined`);
                return nxtx.html('b', { class: "warning" }, `${acronym.value}!`);
            }
            if (usedAcronyms.includes(acronym.value)){
                return nxtx.text(acronym.value);
            }
            usedAcronyms.push(acronym.value);
            return nxtx.text(`${full} (${acronym.value})`);
        }
    },
    hooks: {
        prerender: () => {
            acronyms = {};
            usedAcronyms = [];
        }
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;

