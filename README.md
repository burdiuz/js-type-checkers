# JS-Type-Checkers

[![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-type-checkers/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-type-checkers?branch=master)
[![Build Status](https://travis-ci.org/burdiuz/js-type-checkers.svg?branch=master)](https://travis-ci.org/burdiuz/js-type-checkers)


Library that reports assignments of values or function arguments, return values with inconsistent types.
```
    const myObj = {
      val1: true,
      val2: 'string',
      method: () => {
        return 'str';
      },
      val3: 123,
      list: [],
      child: {
        val1: true,
        val2: 'string',
        method: () => {
          return {};
        },
        val3: 123,
      },
    };

    const typeChecked = TypeCheckers.create(myObj);

    // this code will work as intended, but type errors should spam
    typeChecked.val1 = 'abc';
    typeChecked.val2 = {};

    // will recognize array and show error
    typeChecked.list = {};

    // optional parameter "deep" is set to true by default, so all objects coming from properties will be wrapped too
    typeChecked.child.val3 = false;

    // getting property with wrong type should shows error log too
    const myVal = typeChecked.val2;

    // save types for method
    typeChecked.method(1, 'a', false);

    // show error logs for arguments mismatch
    typeChecked.method('a', 1, false);
```
