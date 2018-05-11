import {
  getTargetInfo,
  hasTargetInfo,
} from './info';

import { create } from '../proxy';

import { isEnabled } from '../enabled';

const objectMerge = (options, ...sources) => {
  let target = {};

  if (isEnabled()) {
    if (!options) {
      options = {
        info: getTargetInfo(sources.find((item) => hasTargetInfo(item))),
        deep: false,
      };
    }

    target = create(target, options);
  }

  return Object.assign(target, ...sources);
};

export default objectMerge;
