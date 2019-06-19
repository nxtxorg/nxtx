/*  Bibliography package for nxtx
    requires:
    - basic-formatting (newpage)
    License: MIT */

const entries = {};
let cited = [];

nxtx.registerCommand('bib-add', (key, entry) => {
    if (!entry || entry.type !== 'dictionary') return console.error('bib-add only must have a dictionary as second argument');
    entries[key.value] = entry.value;
});

nxtx.registerCommand('cite', (...keys) => {
    const numbers = keys.map(arg => {
        let index = cited.indexOf(arg.value);
        if (index === -1) {
            cited.push(arg.value);
            index = cited.length - 1;
        }
        return index + 1;
    });
    return nxtx.html('a', null, `[${numbers.join(', ')}]`);
});

const entryFieldFormatting = {
    author: author => {
        const authors = author.value.split(' and ').map(a => {
            const names = a.split(' ').filter(n => n[0] === n[0].toUpperCase());
            const lastname = names[names.length - 1];
            names.length -= 1;
            const firstnames = names;
            return firstnames.map(n => n[0] + '.').join(' ') + ' ' + lastname;
        }).join(', ');
        return nxtx.html('span', { class: 'bib bib-author' }, authors + '.');
    },
    year: year => nxtx.html('span', { class: 'bib bib-year' }, `(${year.value}).`),
    title: title => nxtx.html('span', { class: 'bib bib-title' }, `“${title.value}”.`),
    url: url => nxtx.html('a', { class: 'bib bib-title', href: url.value, target: '_blank' }, url.value),
    isbn: isbn => nxtx.html('span', { class: 'bib bib-isbn' }, `ISBN: ${isbn.value}.`)
};
nxtx.registerCommand('bib-print', () => {
    const citedEntries = cited.map(e => entries[e] || console.warn(`Bibliography entry '${e}' not found`)).filter(f => !!f);
    if (citedEntries.length === 0) {
        return;
    }
    const mapped = citedEntries.flatMap((entryFields, number) => {
        return nxtx.html('div', { class: 'bib bib-entry' },
            nxtx.html('span', { class: 'bib bib-ordering' }, `[${number + 1}]`),
            ...Object.keys(entryFieldFormatting)
                .filter(k => entryFields[k] !== undefined)
                .map(k => entryFieldFormatting[k](entryFields[k]))
        );
    });
    return {
        type: 'paragraph',
        value: [
            { type: 'command', name: 'newpage', args: [] },
            nxtx.html('h2', { class: 'bibliography' }, 'Bibliography'),
            ...mapped
        ]
    };
});

nxtx.on('prerender', () => cited = []);