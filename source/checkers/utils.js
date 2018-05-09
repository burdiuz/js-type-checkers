
export const GET_PROPERTY = 'GetProperty';
export const SET_PROPERTY = 'SetProperty';
export const ARGUMENTS = 'Arguments';
export const RETURN_VALUE = 'ReturnValue';
export const MERGE = 'Merge';

export const buildPath = sequence => sequence
  .reduce((str, name) => {
    if (String(parseInt(name, 10)) === name) {
      str = `${str}[${name}]`;
    } else if (/^[a-z][\w$]*$/i.test(name)) {
      str = str ? `${str}.${name}` : name;
    } else {
      str = `${str}["${name}"]`;
    }

    return str;
  }, '');
