/*  Package printing rendering time for diagnostics
    Author: Malte Rosenbjerg
    License: MIT */

import {Package, INxtx} from '../nxtx-types';
declare const nxtx: INxtx;

let started;
const pkg : Package = {
    name: 'debug-render-time',
    hooks: {
        prerender: () => started = Date.now(),
        postrender: () => console.log(`rendering document took ${Date.now() - started}ms`)
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;