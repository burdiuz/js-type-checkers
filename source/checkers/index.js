import PrimitiveTypeChecker from './primitive';

let defaultTypeChecker = PrimitiveTypeChecker;

export const getDefaultTypeChecker = () => defaultTypeChecker;
export const setDefaultTypeChecker = (typeChecker) => {
  defaultTypeChecker = typeChecker;
};
