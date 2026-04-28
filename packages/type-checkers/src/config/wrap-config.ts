import { valuesMapFactory } from '@actualwave/closure-value';

export const WRAP_FUNCTION_RETURN_VALUES = 'wrapFunctionReturnValues' as const;
export const WRAP_FUNCTION_ARGUMENTS = 'wrapFunctionArguments' as const;
export const WRAP_SET_PROPERTY_VALUES = 'wrapSetPropertyValues' as const;
export const WRAP_IGNORE_PROTOTYPE_METHODS = 'ignorePrototypeMethods' as const;

export type WrapConfigKey =
  | typeof WRAP_FUNCTION_RETURN_VALUES
  | typeof WRAP_FUNCTION_ARGUMENTS
  | typeof WRAP_SET_PROPERTY_VALUES
  | typeof WRAP_IGNORE_PROTOTYPE_METHODS;

const { getDefault: getDefaultWrapConfig, set: setWrapConfigValue, get } = valuesMapFactory<WrapConfigKey, boolean>(
  [
    [WRAP_FUNCTION_RETURN_VALUES, true],
    [WRAP_FUNCTION_ARGUMENTS, false],
    [WRAP_SET_PROPERTY_VALUES, false],
    [WRAP_IGNORE_PROTOTYPE_METHODS, false],
  ],
  (_key, value) => !!value
);

/** Partially-typed surface that any target info object may carry. */
export type WrapConfigTarget = Partial<Record<WrapConfigKey, boolean>>;

export const getWrapConfigValue = (name: WrapConfigKey, target?: WrapConfigTarget | null): boolean => {
  const perTarget = target?.[name];
  return perTarget !== undefined ? perTarget : (get(name) ?? false);
};

export { getDefaultWrapConfig, setWrapConfigValue };
