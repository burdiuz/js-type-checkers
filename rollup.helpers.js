import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
//import flow from 'rollup-plugin-flow';
import json from 'rollup-plugin-json';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export const DESTINATION_FOLDER = 'dist';

export const LIBRARY_FILE_NAME = 'type-checkers';
export const LIBRARY_VAR_NAME = 'TypeCheckers';

export const plugins = [
  resolve(),
  //flow(),
  babel({
    plugins: [
      'babel-plugin-transform-class-properties',
      'babel-plugin-transform-flow-strip-types',
      ['babel-plugin-transform-object-rest-spread', { useBuiltIns: true }],
      'babel-plugin-external-helpers',
    ],
    exclude: 'node_modules/**',
    externalHelpers: true,
    babelrc: false,
  }),
  commonjs(),
  json(),
];

export const cjsConfig = {
  input: 'source/index.js',
  output: [
    {
      file: 'index.js',
      sourcemap: true,
      exports: 'named',
      format: 'cjs',
    },
  ],
  plugins,
  external: [
    '@actualwave/get-class',
    '@actualwave/has-own',
    '@actualwave/is-function',
    '@actualwave/path-sequence-to-string',
    '@actualwave/type-checker-simple-reporting',
    '@actualwave/with-proxy',
  ],
};

const makeUMDConfig = (suffix = '', additionalPlugins = []) => ({
  input: 'source/index.js',
  output: [
    {
      file: `${DESTINATION_FOLDER}/${LIBRARY_FILE_NAME}${suffix}.js`,
      sourcemap: true,
      exports: 'named',
      name: LIBRARY_VAR_NAME,
      format: 'umd',
    },
  ],
  plugins: [...plugins, ...additionalPlugins],
});

export const umdConfig = makeUMDConfig();

export const umdMinConfig = makeUMDConfig('.min', [uglify({}, minify)]);
