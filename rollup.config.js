import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";

const dev = true;

const plugins = dev ? [

] : [
    terser()
];

export default [
    { name: 'parser', format: 'umd', plugins: [ pegjs({ optimize: 'speed' }), ...plugins ] },
    { name: 'libs/acronyms', format: 'iife', plugins },
    { name: 'libs/basic-formatting', format: 'iife', plugins },
    { name: 'libs/bibliography', format: 'iife', plugins },
    { name: 'libs/debug-render-time', format: 'iife', plugins },
    { name: 'libs/list-of-contents', format: 'iife', plugins },
    { name: 'libs/loading', format: 'iife', plugins },
    { name: 'libs/styling', format: 'iife', plugins },
].map(entry => ({
    input: `src/${entry.name}.js`,
    output: {
        name: 'nxtx',
        file: `dist/${entry.name}.js`,
        format: entry.format,
        sourcemap: true
    },
    plugins: entry.plugins
}));

