# JS-Type-Checkers

[![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-type-checkers/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-type-checkers?branch=master)
[![Build Status](https://travis-ci.org/burdiuz/js-type-checkers.svg?branch=master)](https://travis-ci.org/burdiuz/js-type-checkers)




Library that reports assignments of values or function arguments, return values with wrong types.
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

### TODOs
1.  +Add global methods to copy and apply configs, they should work with typeChecker.mergeConfig() method
2.  +Add possibility to merge objects with type information using mergeConfigs()
3.  +Decide, when setting value to a property, should this value be wrapped?
4.  +Decide, when calling function, should arguments and return value be wrapped?
5.  ?Lazy typings for Arrays or apply one type(from first element) for all items.
    Indexed type is available, still don't know about lazy arrays
6.  +Implement "createDeep()"
7.  Cache child info for arguments
8.  +Add ability to setup custom value validators for default type checker
9.  +Ignore accessing functions from prototype all the time
10. Add option to ignore any kind of properties available via prototype
11. +Implement replaceProperty() -> property()
12. +Add possibility to make proxy config be part of target's info
13. +Move primitive type checker into separate repo
14. Add possibility to register ignored names which will be just skipped whatewer is placed in, probably could be added to ExtendedTypeChecker.
15. Add methods to convert info objects into primitives and back so they could be stored, would be good to have a system that permanently stores types info for consecutive runs.
