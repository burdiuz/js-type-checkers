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

export const baseConfig = {
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
};

export const umdConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.umd.js',
      sourcemap: true,
      exports: 'named',
      format: 'umd',
      name: 'TypeCheckerSimpleReporting',
    },
  ],
  plugins,
};
