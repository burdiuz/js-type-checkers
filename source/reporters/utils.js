/* eslint-disable import/prefer-default-export */

export const constructErrorString = (action, name, required, received) =>
  `${action}Error on "${name}" instead of "${required}" received "${received}"`;
