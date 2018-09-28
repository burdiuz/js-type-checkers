import hasOwn from '@actualwave/has-own';

export const singleConfigFactory = (defaultValue = null, validator = undefined) => {
  let value = defaultValue;

  return {
    get: () => value,
    set: (newValue = defaultValue) => {
      if (validator) {
        value = validator(newValue);
      } else {
        value = newValue;
      }
    },
  };
};

export const mapConfigFactory = (defaultValues = {}, validator = undefined) => {
  const getDefault = () => ({ ...defaultValues });

  const values = getDefault();

  return {
    values,
    getDefault,
    set: (newValues) => Object.assign(values, validator ? validator(newValues) : newValues),
    get: () => ({ ...values }),
    getValue: (key) => (hasOwn(values, key) ? values[key] : undefined),
  };
};
