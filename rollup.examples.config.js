const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const cleanup = require('rollup-plugin-cleanup');

export default {
  input: 'examples/examples.js',
  output: [{
    file: './examples/build.js',
    format: 'umd',
    name: 'App',
    // globals: {
    //   'three': 'THREE',
    // },
    // paths: {
    //   three: './examples/node_modules/three/build/three.module.js'
    // }
  }],
  
  plugins: [
    resolve(),
    commonjs(),
    cleanup(),
  ],
};
