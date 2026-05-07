import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export const plugins = [
  resolve(),
  typescript({ tsconfig: './tsconfig.json' }),
  commonjs(),
  json(),
];

const external = [
  '@actualwave/get-class',
  '@actualwave/path-sequence-to-string',
  '@actualwave/with-proxy',
  '@actualwave/closure-value',
];

export const cjsConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      sourcemap: true,
      exports: 'named',
      format: 'cjs',
    },
  ],
  plugins,
  external,
};

export const umdConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.umd.js',
      sourcemap: true,
      exports: 'named',
      format: 'umd',
      name: 'TypeCheckers',
      globals: {
        '@actualwave/get-class': 'ActualwaveGetClass',
        '@actualwave/path-sequence-to-string': 'ActualwavePathSequenceToString',
        '@actualwave/with-proxy': 'ActualwaveWithProxy',
        '@actualwave/closure-value': 'ActualwaveClosureValue',
      },
    },
  ],
  plugins,
  external,
};
