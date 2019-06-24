(function () {
    'use strict';

    /*  Bibliography package for nxtx
        requires:
        - basic-formatting (newpage)
        Author: Malte Rosenbjerg
        License: MIT */

    const entries = {};
    let cited = [];

    const style = document.createElement("style");
    style.id = 'bibliography-style-block';
    document.head.appendChild(style);


    nxtx.registerCommand('bib-add', (key, entry) => {
        if (!entry || entry.type !== 'dictionary') return console.error('bib-add only must have a dictionary as second argument');
        entries[key.value] = entry.value;
    });

    nxtx.registerCommand('cite', async (...args) => {
        const cites = args.flatMap(arg => {
            let index = cited.indexOf(arg.value);
            if (index === -1) {
                cited.push(arg.value);
                index = cited.length - 1;
            }
            const e = nxtx.htmlLite('a', { href: `#---${arg.value}`});
            e.innerText = index + 1;
            return [ e, ', ' ];
        });
        cites.length -= 1;
        return nxtx.html('span', null, '[', ...cites, ']');
    });

    const formatAuthors = author => {
        const authors = author.value.split(' and ').map(a => {
            const split = a.split(',');
            if (split.length > 1) a = split[1].trim() + ' ' + split[0];
            const names = a.split(' ').filter(n => n[0] === n[0].toUpperCase());
            const lastname = names[names.length - 1];
            names.length -= 1;
            return names.map(n => n[0] + '.').join(' ') + ' ' + lastname;
        }).join(', ');
        return nxtx.html('span', { class: 'bib bib-author' }, authors + '.');
    };

    const entryFieldFormatting = {
        author: formatAuthors,
        year: year => nxtx.html('span', { class: 'bib bib-year' }, `(${year.value}).`),
        title: title => nxtx.html('span', { class: 'bib bib-title' }, `“${title.value}”.`),
        url: url => nxtx.html('a', { class: 'bib bib-url', href: url.value, target: '_blank' }, url.value),
        isbn: isbn => nxtx.html('span', { class: 'bib bib-isbn' }, `ISBN: ${isbn.value}.`)
    };
    nxtx.registerCommand('bib-print', async () => {
        const citedEntries = cited.map(e => entries[e] || console.warn(`Bibliography entry '${e}' not found`)).filter(f => !!f);
        if (citedEntries.length === 0) {
            return;
        }
        const mapped = citedEntries.map((entryFields, number) => nxtx.html('div', { id: `---${cited[number]}`, class: 'bib bib-entry'},
                nxtx.html('span', { class: 'bib bib-ordering'}, `[${number + 1}]`),
                ...Object.keys(entryFieldFormatting)
                    .filter(k => entryFields[k] !== undefined)
                    .map(k => entryFieldFormatting[k](entryFields[k]))
        ));
        return [
            { type: 'command', name: 'pagebreak', args: [] },
            nxtx.html('h2', { class: 'bibliography' }, 'Bibliography'),
            ...mapped
        ];
    });

    nxtx.on('prerender', () => cited = []);

    // Default
    style.sheet.insertRule('.bib-entry { margin-bottom: 5px }', 0);
    style.sheet.insertRule(`.bib-entry span { margin-right: 5px }`, 1);

}());
//# sourceMappingURL=bibliography.js.map
