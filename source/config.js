
const configKey = Symbol('data-checkers::config');

export const getConfig = (target) => target[configKey];
export const setConfig = (target, config) => target[configKey] = config;

export const getTypeCheckerConfig = (target) => target[configKey] && target[configKey].typeChecker;
