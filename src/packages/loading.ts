/*  Package for loading documents and packages
    Author: Malte Rosenbjerg
    License: MIT */

import Nxtx from '../nxtx-interface';
import { Package } from '../nxtx-types';
declare const nxtx: Nxtx;

let loaded = {
    documents: {},
    packages: []
};

const pkg : Package = {
    name: 'loading',
    preprocessors: {
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
        },

        'load:package': srcNode => new Promise((acc, rej) => {
            if (loaded.packages[srcNode.value])
                return acc();
            loaded.packages[srcNode.value] = true;
            const script = document.createElement('script');
            script.src = srcNode.value;
            script.async = true;
            let done = false;
            // @ts-ignore
            script.onreadystatechange = script.onload = () => {
                // @ts-ignore
                if (!done && (!script.readyState || /loaded|complete/.test(script.readyState))) {
                    done = true;
                    acc();
                }
            };
            document.head.appendChild(script);
        })
    }
};

if (nxtx) {
    Object.keys(pkg.preprocessors).forEach(name => nxtx.registerPreprocessor(name, pkg.preprocessors[name]));
}

export default pkg;