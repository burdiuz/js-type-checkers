let defaultTypeChecker = null;

const getDefaultTypeChecker = () => defaultTypeChecker;
const setDefaultTypeChecker = (typeChecker) => {
  defaultTypeChecker = typeChecker;
};

export {
  getDefaultTypeChecker,
  setDefaultTypeChecker,
};
