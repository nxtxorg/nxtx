/*  Package printing rendering time for diagnostics
    Author: Malte Rosenbjerg
    License: MIT */

let started;
nxtx.on('prerender', () => started = Date.now());
nxtx.on('postrender', () => console.log(`rendering document took ${Date.now() - started}ms`));
