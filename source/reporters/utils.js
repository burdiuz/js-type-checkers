/* eslint-disable import/prefer-default-export */

export const constructErrorString = (action, name, required, actual) =>
  `${action}Error on "${name}" instead of "${required}" received "${actual}"`;
