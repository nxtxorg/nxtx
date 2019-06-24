import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const dev = true;

const plugins = dev ? [
    resolve(),
    commonjs()
] : [
    resolve(),
    commonjs(),
    terser()
];

export default [
    { name: 'parser', format: 'umd', outputName: 'nxtx', plugins: [ pegjs({ optimize: 'speed' }), ...plugins ] },
    { name: 'packages/acronyms', outputName: 'nxtx_acronyms', format: 'iife', plugins },
    { name: 'packages/basic-formatting', outputName: 'nxtx_basic_formatting', format: 'iife', plugins },
    { name: 'packages/bibliography', outputName: 'nxtx_bibliography', format: 'iife', plugins },
    { name: 'packages/core', outputName: 'nxtx_core', format: 'iife', plugins },
    { name: 'packages/debug-render-time', outputName: 'debug_render_time', format: 'iife', plugins },
    { name: 'packages/layout', outputName: 'nxtx_layout', format: 'iife', plugins },
    { name: 'packages/list-of-contents', outputName: 'nxtx_list_of_contents', format: 'iife', plugins },
    { name: 'packages/loading', outputName: 'nxtx_loading', format: 'iife', plugins },
    { name: 'packages/styling', outputName: 'nxtx_styling', format: 'iife', plugins },
].map(entry => ({
    input: `src/${entry.name}.js`,
    output: {
        name: entry.outputName,
        file: `docs/demo/${entry.name}.js`,
        format: entry.format,
        sourcemap: true
    },
    plugins: entry.plugins
}));

