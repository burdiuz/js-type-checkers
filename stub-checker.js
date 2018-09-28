class StubTypeChecker {
  init(target, errorReporter, data) {}

  mergeConfigs(targetData, sourceData, names) {}

  getProperty(target, names, value, data) {}
  setProperty(target, names, value, data) {}

  arguments(target, names, argumentsList, data) {}
  returnValue(target, names, result, data) {}

  deleteProperty(target, names, value, data) {}
}
