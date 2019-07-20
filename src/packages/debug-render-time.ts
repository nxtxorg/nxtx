/*  Package printing rendering time for diagnostics
    Author: Malte Rosenbjerg
    License: MIT */

import { Package, Nxtx } from '../nxtx-types';
declare const nxtx: Nxtx;

let started;
nxtx.on('prerender', () => started = Date.now());
nxtx.on('postrender', () => console.log(`rendering document took ${Date.now() - started}ms`));