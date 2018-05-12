# JS-Type-Checkers

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
1. +Add global methods to copy and apply configs, they should work with typeChecker.mergeConfig() method
2. +Add possibility to merge objects with type information using mergeConfigs()
3. +Decide, when setting value to a property, should this value be wrapped?
4. +Decide, when calling function, should arguments and return value be wrapped?
5. Lazy typings for Arrays or apply one type(from first element) for all items.
6. +Implement "createDeep()"
7. Cache child info for arguments
8. +Add ability to setup custom value validators for default type checker
