import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

import fs from 'fs';


import pkg from './package.json';

const dev = process.env.NODE_ENV !== 'production';

function copyNxTxInterface () {
    return {
        name: 'copy-nxtx-interface',
        generateBundle ( source ) {
            if (source === 'virtual-module') {
                return source;
            }

            const sourcePath = 'src/nxtx-interface.ts';
            const ignoredFolders = ['nxtx', 'demo', '.idea', 'paper-css'];
            fs.readdirSync('../')
                .filter(f => !ignoredFolders.includes(f))
                .map(f => `../${f}/nxtx-interface.ts`)
                .filter(f => fs.existsSync(f))
                .forEach(f => fs.copyFile(sourcePath, f, () => {}));
        }
    };
}


const plugins = dev ? [
    pegjs({ optimize: 'speed' }),
    resolve(),
    commonjs(),
    typescript(),
    copyNxTxInterface()
] : [
    pegjs({ optimize: 'speed' }),
    resolve(),
    commonjs(),
    typescript(),
    terser(),
    copyNxTxInterface()
];


export default {
    input: `src/${pkg.name}.ts`,
    output: {
        name: pkg.name.replace(/-/g, '_'),
        file: `build/${pkg.name}${(!dev ? '.min' : '')}.js`,
        format: 'umd',
        sourcemap: true
    },
    plugins: plugins
}
