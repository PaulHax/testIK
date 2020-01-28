const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const cleanup = require('rollup-plugin-cleanup');
const babel = require('rollup-plugin-babel');

import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.js',
  external: ['three'],
  output: [{
    file: './build/build.js',
    format: 'umd',
    name: 'three-actor',
    sourcemap: true,
    globals: {
      'three': 'THREE',
    },
  }, {
    file: './build/build.module.js',
    format: 'es',
    paths: {
      'three': './node_modules/three/build/three.module.js'
    },
  }],
 
  watch: {
    include: 'src/**',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      sourceMaps: true,
    }),
    resolve(),
    commonjs(),
    cleanup(),
    serve({
      contentBase: ['examples', 'build']
    }),
    livereload(
      {
        watch: ['examples', 'build'],
      }
    )
  ],
};
