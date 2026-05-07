import { cjsConfig, umdConfig } from './rollup.helpers.js';
import copy from 'rollup-plugin-copy';

export default [
  {
    ...cjsConfig,
    plugins: [
      ...cjsConfig.plugins,
      copy({
        targets: [
          { src: 'README.md', dest: 'dist' },
          { src: '../../LICENSE', dest: 'dist' },
          {
            src: 'package.json',
            dest: 'dist',
            transform: (contents) => {
              const { scripts, jest, ...pkg } = JSON.parse(contents);
              pkg.main = 'index.js';
              pkg.types = 'index.d.ts';
              return JSON.stringify(pkg, null, 2);
            },
          },
        ],
      }),
    ],
  },
  umdConfig,
];
