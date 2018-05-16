const GET_PROPERTY = '(GetProperty)';
const SET_PROPERTY = '(SetProperty)';
const ARGUMENTS = '(Arguments)';
const RETURN_VALUE = '(ReturnValue)';

function AsIs(value) {
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

const buildPath = sequence => sequence.reduce((str, name) => {
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

export { GET_PROPERTY, SET_PROPERTY, ARGUMENTS, RETURN_VALUE, AsIs, buildPath };
//# sourceMappingURL=checkers.js.map
