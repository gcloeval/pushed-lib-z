import { DEFAULT_EXTENSIONS } from '@babel/core'

import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import autoExternal from 'rollup-plugin-auto-external'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import visualizer from 'rollup-plugin-visualizer'
import analyze from 'rollup-plugin-analyzer'
import { terser } from 'rollup-plugin-terser'
import rollupGrapher from 'rollup-plugin-grapher'

const pkg = require('./package.json')

const libraryName = 'pushed-lib-z'

// const replacements = [{ original: 'lodash', replacement: 'lodash-es' }];

// const babelOptions = (format: 'cjs' | 'es' | 'umd', target: 'node' | 'browser') => ({
//   exclude: 'node_modules/**',
//   extensions: [...DEFAULT_EXTENSIONS, 'ts', 'tsx'],
//   passPerPreset: true, // @see https://babeljs.io/docs/en/options#passperpreset
//   presets: [
//     [
//       require.resolve('@babel/preset-env'),
//       {
//         loose: true,
//         modules: false,
//         targets: target === 'node' ? { node: '8' } : undefined,
//         exclude: ['transform-async-to-generator']
//       }
//     ]
//   ],
//   plugins: [
//     require.resolve('babel-plugin-annotate-pure-calls'),
//     require.resolve('babel-plugin-dev-expression'),
//     format !== 'cjs' && [require.resolve('babel-plugin-transform-rename-import'), { replacements }],
//     [
//       require.resolve('babel-plugin-transform-async-to-promises'),
//       { inlineHelpers: true, externalHelpers: true }
//     ],
//     [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }]
//   ].filter(Boolean)
// })

export default {
  // input: `src/${libraryName}.ts`,
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  // external: ['react', 'react-dom'],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),

    // Compile TypeScript files
    typescript({ clean: true, useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    autoExternal(),
    // resolve(),

    // Resolve source maps to the original source
    sourceMaps(),

    // prettier-ignore
    replace({
      '__DEV__': "process.env.NODE_ENV !== 'production'"
    }),
    // visualizer({
    //   filename: './statistics.html',
    //   title: 'My Bundle',
    //   open: true
    // }),
    analyze()
    // rollupGrapher()
    // terser()
  ]
}
