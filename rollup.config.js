import { baseConfig, minConfig, utilConfigs } from './rollup.helpers';

export default [
  baseConfig,
  minConfig,
  ...utilConfigs,
];
