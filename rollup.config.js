import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

const dev = true;

const plugins = dev ? [
    resolve(),
    commonjs(),
    typescript(),
] : [
    resolve(),
    commonjs(),
    terser()
];

export default [
    { name: 'typed-nxtx-renderer.ts', format: 'umd', outputName: 'nxtx', plugins: [ pegjs({ optimize: 'speed' }), ...plugins ] },
    { name: 'packages/acronyms.ts', outputName: 'nxtx_acronyms', format: 'iife', plugins },
    { name: 'packages/basic-formatting.ts', outputName: 'nxtx_basic_formatting', format: 'iife', plugins },
    { name: 'packages/bibliography.ts', outputName: 'nxtx_bibliography', format: 'iife', plugins },
    { name: 'packages/core.ts', outputName: 'nxtx_core', format: 'iife', plugins },
    { name: 'packages/debug-render-time.ts', outputName: 'debug_render_time', format: 'iife', plugins },
    { name: 'packages/images.ts', outputName: 'nxtx_images', format: 'iife', plugins },
    { name: 'packages/layout.ts', outputName: 'nxtx_layout', format: 'iife', plugins },
    { name: 'packages/list-of-contents.ts', outputName: 'nxtx_list_of_contents', format: 'iife', plugins },
    { name: 'packages/loading.ts', outputName: 'nxtx_loading', format: 'iife', plugins },
    { name: 'packages/styling.ts', outputName: 'nxtx_styling', format: 'iife', plugins },
].map(entry => ({
    input: `src/${entry.name}`,
    output: {
        name: entry.outputName,
        file: `docs/demo/${entry.name.replace('.ts', '.js')}`,
        format: entry.format,
        sourcemap: true
    },
    plugins: entry.plugins
}));

