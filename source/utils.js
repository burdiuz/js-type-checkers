import { getTargetInfo } from './target';

const validTypes = {
    object: true,
    function: true,
};

export const isValidTarget = (target) => target && validTypes[typeof target];
export const isTypeChecked = (target) => !!getTargetInfo(target);