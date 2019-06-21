import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";

const dev = true;

const plugins = dev ? [

] : [
    terser()
];

export default [
    { name: 'parser', format: 'umd', plugins: [ pegjs({ optimize: 'speed' }), ...plugins ] },
    { name: 'packages/acronyms', format: 'iife', plugins },
    { name: 'packages/basic-formatting', format: 'iife', plugins },
    { name: 'packages/bibliography', format: 'iife', plugins },
    { name: 'packages/debug-render-time', format: 'iife', plugins },
    { name: 'packages/list-of-contents', format: 'iife', plugins },
    { name: 'packages/loading', format: 'iife', plugins },
    { name: 'packages/styling', format: 'iife', plugins },
].map(entry => ({
    input: `src/${entry.name}.js`,
    output: {
        name: 'nxtx',
        file: `docs/demo/${entry.name}.js`,
        format: entry.format,
        sourcemap: true
    },
    plugins: entry.plugins
}));

