/*  Image package for nxtx
    Author: Malte Rosenbjerg
    License: MIT */

import Nxtx from '../nxtx-interface';
import {NodeType, Package} from '../nxtx-types';
declare const nxtx: Nxtx;

const pkg : Package = {
    name: 'images',
    commands: {
        'image': (srcNode, pctNode = { type: NodeType.Number, value: 100 }) => nxtx.htmlLite('img', { src: srcNode.value, style: `max-width: ${pctNode.value}%` }),
        'images': (srcArray) => srcArray.value.map(srcNode => nxtx.htmlLite('img', { src: srcNode.value, style: `max-width: calc(${(99.9 / srcArray.value.length)}% - 4px); margin: 2px` }))
    }
};

if (nxtx) {
    Object.keys(pkg.commands).forEach(name => nxtx.registerCommand(name, pkg.commands[name]));
}

export default pkg;