import PrimitiveTypeChecker from './primitive';

let defaultTypeChecker = PrimitiveTypeChecker;

const getDefaultTypeChecker = () => defaultTypeChecker;
const setDefaultTypeChecker = (typeChecker) => {
  defaultTypeChecker = typeChecker;
};

export {
  PrimitiveTypeChecker,
  getDefaultTypeChecker,
  setDefaultTypeChecker,
};
