
export const GET_PROPERTY = '(GetProperty)';
export const SET_PROPERTY = '(SetProperty)';
export const INDEX = '(Index)';
export const ARGUMENTS = '(Arguments)';
export const RETURN_VALUE = '(ReturnValue)';
export const MERGE = '(Merge)';

export function AsIs(value) {
  if (this instanceof AsIs) {
    this.value = value;
  } else {
    return new AsIs(value);
  }
}

function asIs() {
  return this.value;
}

AsIs.prototype.toString = asIs;
AsIs.prototype.valueOf = asIs;
AsIs.prototype[Symbol.toPrimitive] = asIs;

export const buildPath = (sequence) => sequence
  .reduce((str, name) => {
    if (name instanceof AsIs) {
      str = `${str}${name}`;
    } else if (String(parseInt(name, 10)) === name) {
      str = `${str}[${name}]`;
    } else if (/^[a-z][\w$]*$/i.test(name)) {
      str = str ? `${str}.${name}` : name;
    } else {
      str = `${str}["${name}"]`;
    }

    return str;
  }, '');
