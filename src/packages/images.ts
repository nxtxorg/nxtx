/*  Image package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

import {NodeType, Package, INxtx} from '../nxtx-types';
declare const nxtx: INxtx;

const pkg : Package = {
    name: 'images',
    commands: {
        'image': (srcNode, pctNode = { type: NodeType.Number, value: 100 }) => nxtx.htmlLite('img', { src: srcNode.value, style: `max-width: ${pctNode.value}%` }),
        'images': (srcArray) => srcArray.value.map(srcNode => nxtx.htmlLite('img', { src: srcNode.value, style: `max-width: calc(${(99.9 / srcArray.value.length)}% - 4px); margin: 2px` }))
    }
};

if (nxtx) nxtx.registerPackage(pkg);

export default pkg;