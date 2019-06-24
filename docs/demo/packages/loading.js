var nxtx_loading = (function () {
    'use strict';

    /*  Package for loading documents and packages
        Author: Malte Rosenbjerg
        License: MIT */

    let loaded = {
        documents: {},
        packages: []
    };

    const pkg = {
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
        Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
        Object.keys(pkg.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg.preprocessors[name]));
    }

    return pkg;

}());
//# sourceMappingURL=loading.js.map
