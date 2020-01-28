const commonjs = require('rollup-plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const cleanup = require('rollup-plugin-cleanup');
const babel = require('rollup-plugin-babel');

export default {
  input: 'src/index.js',
  external: ['three'],
  output: [{
    file: './build/build.js',
    format: 'umd',
    name: 'starter', 
    globals: {
      'three': 'THREE',
    },
  }, {
    file: './build/build.module.js',
    format: 'esm',
    // globals: {
    //   'three': 'THREE',
    // },
  }],
 
  watch: {
    include: 'src/**',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    resolve(),
    commonjs(),
    cleanup()
  ],
};
