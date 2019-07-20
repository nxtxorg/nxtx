var nxtx_acronyms = (function () {
    'use strict';

    var acronyms = {};
    var usedAcronyms = [];
    var pkg = {
        name: 'acronyms',
        requires: ['basic-formatting'],
        commands: {
            'define-ac': function (acronym, full) { return (acronyms[acronym.value] = full.value) && undefined; },
            'ac': function (acronym) {
                var full = acronyms[acronym.value];
                if (!full) {
                    console.warn("Acronym '" + acronym.value + "' not defined");
                    return nxtx.html('b', { class: "warning" }, acronym.value + "!");
                }
                if (usedAcronyms.includes(acronym.value)) {
                    return nxtx.text(acronym.value);
                }
                usedAcronyms.push(acronym.value);
                return nxtx.text(full + " (" + acronym.value + ")");
            }
        },
        hooks: {
            prerender: function () {
                acronyms = {};
                usedAcronyms = [];
            }
        }
    };
    if (nxtx)
        nxtx.registerPackage(pkg);

    return pkg;

}());
//# sourceMappingURL=acronyms.js.map
