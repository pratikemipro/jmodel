// Generated by CoffeeScript 1.6.2
define(['jmodel/opal2'], function() {
  module('Array');
  test('Array.concat', function() {
    deepEqual(Array.concat(), [], 'Concatenation of zero arrays is empty array');
    deepEqual(Array.concat([1, 2, 3]), [1, 2, 3], 'Concatenation of one array is array');
    deepEqual(Array.concat([1, 2], [3, 4], [5, 6]), [1, 2, 3, 4, 5, 6], 'Concatenation works with more than two arguments');
    return deepEqual(Array.concat([1, 2], 3, 4, [5, 6]), [1, 2, 3, 4, 5, 6], 'Concatenation treats bare elements as one-element arrays');
  });
  test('Array.zip', function() {
    deepEqual(Array.zip(), [], 'Zip of zero arrays is empty array');
    deepEqual(Array.zip([1, 2]), [[1], [2]], 'Zip works with one argument');
    deepEqual(Array.zip([1, 2], [3, 4]), [[1, 3], [2, 4]], 'Zip works with two arguments');
    deepEqual(Array.zip([1, 2, 3], [4, 5, 6], [7, 8, 9]), [[1, 4, 7], [2, 5, 8], [3, 6, 9]], 'Zip works with more than two arguments');
    return deepEqual(Array.zip([1, 2], [3, 4, 5]), [[1, 3], [2, 4]], 'Only zips matching elements of arrays of unequal length');
  });
  test('Array.flatten', function() {
    deepEqual(Array.flatten(), [], 'Empty argument flattens to empty array');
    deepEqual(Array.flatten([1, 2, 3, 4]), [1, 2, 3, 4], 'Flat array is returned unchanged');
    deepEqual(Array.flatten([[1, 2], [3, 4], [5, 6]]), [1, 2, 3, 4, 5, 6], 'Flattens array of arrays');
    return deepEqual(Array.flatten([[1, [2, 3]], [[4, 5], 6]]), [1, 2, 3, 4, 5, 6], 'Flatten works with differing depths');
  });
  test('Array.hastypes', function() {
    equal(Array.hastypes(Number, String)([5]), false, 'Returns false for argument of wrong cardinality');
    equal(Array.hastypes(Number)([5]), true, 'Returns true for single element array having correct type');
    return equal(Array.hastypes(Number, String, Number)([5, 'fred', 7]), true, 'Works for longer arrays');
  });
  module('Object');
  test('Object.extend', function() {
    var source, target;

    source = {
      forename: 'john',
      surname: 'smith'
    };
    target = {};
    Object.extend(target, source);
    equals(target.forename, 'john', 'Copies first property correctly');
    return equals(target.surname, 'smith', 'Copies second property correctly');
  });
  test('Object.construct', function() {
    var Person;

    Person = function(name, age) {
      this.name = name;
      this.age = age;
    };
    equals(Object.construct(Person)('fred', 16) instanceof Person, true, 'Creates object of correct type');
    equals(Object.construct(Person)('fred', 16).name, 'fred', 'First argument passed correctly');
    equals(Object.construct(Person)('fred', 16).age, 16, 'Second argument passed correctly');
    equals(Object.construct(Person, 'fred')(16).name, 'fred', 'Arguments can be passed in at definition time');
    equals(Object.construct(Person, 'fred')(16).age, 16, 'Arguments at call time passed in correctly when there are definition time arguments');
    equals(typeof Object.construct(String)('fred'), 'string', 'Construct handles strings correctly');
    equals(typeof Object.construct(Number)(7), 'number', 'Construct handles numbers correctly');
    equals(typeof Object.construct(Boolean)(true), 'boolean', 'Construct handles booleans correctly');
    equals(Object.construct(Boolean)(true), true, 'Construct handles boolean true correctly');
    equals(Object.construct(Boolean)(false), false, 'Construct handles boolean false correctly');
    equals(Object.construct(Date)('1997-8-29') instanceof Date, true, 'Construct creates date from string');
    equals(Object.construct(Date)('1997-8-29').getFullYear(), 1997, 'Construct creates date with correct year from string');
    equals(Object.construct(Date)('1997-8-29').getMonth(), 7, 'Construct creates date with correct month index from string');
    equals(Object.construct(Date)('1997-8-29').getDate(), 29, 'Construct creates date with correct day from string');
    equals(Object.construct(Date)('1997-8-29') instanceof Date, true, 'Construct creates date from string');
    equals(Object.construct(Date)('1997-8-29').getFullYear(), 1997, 'Construct creates date with correct year from string');
    equals(Object.construct(Date)('1997-8-29').getMonth(), 7, 'Construct creates date with correct month index from string');
    equals(Object.construct(Date)('1997-8-29').getDate(), 29, 'Construct creates date with correct day from string');
    equals(Object.construct(Date)(1997, 7, 29) instanceof Date, true, 'Construct creates date from three integers');
    equals(Object.construct(Date)(1997, 7, 29).getFullYear(), 1997, 'Construct creates date with correct year from three integers');
    equals(Object.construct(Date)(1997, 7, 29).getMonth(), 7, 'Construct creates date with correct month index from three integers');
    equals(Object.construct(Date)(1997, 7, 29).getDate(), 29, 'Construct creates date with correct day from three integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231) instanceof Date, true, 'Construct creates date from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getFullYear(), 1997, 'Construct creates date with correct year from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getMonth(), 7, 'Construct creates date with correct month index from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getDate(), 29, 'Construct creates date with correct day from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getHours(), 11, 'Construct creates date with correct hours from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getMinutes(), 37, 'Construct creates date with correct minutes from seven integers');
    equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getSeconds(), 45, 'Construct creates date with correct seconds from seven integers');
    return equals(Object.construct(Date)(1997, 7, 29, 11, 37, 45, 231).getMilliseconds(), 231, 'Construct creates date with correct milliseconds from seven integers');
  });
  test('Object.ensure', function() {
    var Person, fred;

    Person = function(name, age) {
      this.name = name;
      this.age = age;
    };
    fred = new Person('fred', 30);
    equals(Object.ensure(Person)(fred), fred, 'Acts as identity when object is already of type');
    equals(Object.ensure(Person)('jane', 28) instanceof Person, true, 'Constructs new object when arguments not already of type');
    return equals(Object.ensure(Person, 'fred')(28).name, 'fred', 'Allows passing at definition time');
  });
  module('Bare objects');
  test('Object.equal', function() {
    equals(Object.equal(void 0, {
      name: 'fred'
    }), false, 'Returns false if first argument undefined');
    equals(Object.equal({
      name: 'fred'
    }, void 0), false, 'Returns false if second argument undefined');
    equals(Object.equal({
      name: 'fred',
      age: 20
    }, {
      name: 'fred',
      age: 20
    }), true, 'Returns true if objects have same properties and property valeus');
    equals(Object.equal({
      name: 'fred',
      age: 20
    }, {
      name: 'fred'
    }), false, 'Returns false if first object has a property that second does not have');
    equals(Object.equal({
      name: 'fred'
    }, {
      name: 'fred',
      age: 20
    }), false, 'Returns false if second object has a property that second does not have');
    return equals(Object.equal({
      name: 'fred',
      age: 20
    }, {
      name: 'fred',
      age: 25
    }), false, 'Returns false if objects have same properties but different property valeus');
  });
  test('Object.remove', function() {
    var removeProperties;

    removeProperties = Object.remove('age', 'surname');
    equals(removeProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).age, void 0, 'Removes first listed property');
    equals(removeProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).surname, void 0, 'Removes second listed property');
    return equals(removeProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).forename, 'fred', 'Leaves other properties unchanged');
  });
  test('project', function() {
    var projectProperties;

    projectProperties = Object.project('age', 'surname');
    equals(projectProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).age, 20, 'Preserves first listed property');
    equals(projectProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).surname, 'smith', 'Preserves other listed properties');
    return equals(projectProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).forename, void 0, 'Removes other listed properties');
  });
  test('rename', function() {
    var renameProperties;

    renameProperties = Object.rename({
      forename: 'personalName',
      surname: 'familyName'
    });
    equals(renameProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).forename, void 0, 'Old name of first renamed property unavailable');
    equals(renameProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).surname, void 0, 'Old name of second renamed property unavailable');
    equals(renameProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).personalName, 'fred', 'New name of first renamed property available');
    equals(renameProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).familyName, 'smith', 'New name of second renamed property available');
    return equals(renameProperties({
      forename: 'fred',
      surname: 'smith',
      age: 20
    }).age, 20, 'Other properties preserved');
  });
  test('union', function() {
    var a, b, c, d;

    a = {
      forename: 'fred',
      surname: 'smith'
    };
    b = {
      surname: 'jones',
      age: 20
    };
    c = {
      department: 'IT'
    };
    d = Object.union(a, b, c);
    equals(d.forename, 'fred', 'Union has property possed only by first object');
    equals(d.age, 20, 'Union has property possed only by second object');
    equals(d.department, 'IT', 'Union has property possed only by third object');
    notEqual(d.surname, void 0, 'Union has shared property');
    equals(d.surname, 'jones', 'Later objects supercede earlier ones for shared property values');
    deepEqual(Object.union(a), a, 'Union of single object is a copy of that object');
    return deepEqual(Object.union(), {}, 'Union of no objects is undefined');
  });
  module('Basic functions');
  test('Function.identity', function() {
    var obj;

    obj = {
      name: 'test'
    };
    equals(Function.identity(obj), obj, 'Works for objects');
    return equals(Function.identity(17), 17, 'Words for bare values');
  });
  test('Function.constant', function() {
    var fred;

    fred = Function.constant('fred');
    equals(fred(), 'fred', 'Works with no arguments');
    return equals(fred(1, 2, 3), 'fred', 'Works with arguments');
  });
  test('Function.argument', function() {
    equals(Function.argument(0).call(this, 'red', 'green', 'blue'), 'red', 'Function.argument(0) works');
    equals(Function.argument(1).call(this, 'red', 'green', 'blue'), 'green', 'Function.argument(1) works');
    equals(Function.argument(2).call(this, 'red', 'green', 'blue'), 'blue', 'Function.argument(2) works');
    return equals(Function.argument(4).call(this, 'red', 'green', 'blue'), void 0, 'Function.argument(4) returns undefined if beyond bounds');
  });
  test('Function.map', function() {
    var counts;

    counts = Function.map({
      quarks: 6,
      chargedLeptons: 3,
      neutrinos: 3
    });
    equals(counts('quarks'), 6, 'Works for first mapping entry');
    return equals(counts('chargedLeptons'), 3, 'Works for other mapping entries');
  });
  module('Function composition');
  test('Function::then', function() {
    var blue, green, red;

    red = function(arr) {
      arr.push('red');
      return arr;
    };
    green = function(arr) {
      arr.push('green');
      return arr;
    };
    blue = function(arr) {
      arr.push('blue');
      return arr;
    };
    deepEqual(red.then(green)([]), ['red', 'green'], 'then works');
    deepEqual(red.then(green.then(blue))([]), red.then(green).then(blue)([]), 'then is associative');
    return raises((function() {
      return red.then('green');
    }), 'Raises an exception if argument is not a function');
  });
  test('Function::but', function() {
    var arr, length, red;

    arr = [];
    red = function(arr) {
      arr.push('red');
      return arr;
    };
    length = function(arr) {
      return arr.length;
    };
    equal(red.but(length)(arr), 1, 'return value of second returned');
    deepEqual(arr, ['red'], 'first function has been applied');
    return raises((function() {
      return red.but('green');
    }), 'Raises an exception if argument is not a function');
  });
  test('Function.pipe', function() {
    var addten, times2;

    times2 = function(x) {
      return 2 * x;
    };
    addten = function(x) {
      return x + 10;
    };
    equals(Function.pipe(times2, addten)(7), 24, 'piping of two functions works');
    equals(Function.pipe(addten, times2)(7), 34, 'piping works in opposite direction');
    equals(Function.pipe(times2)(7), 14, 'pipe of a single function is just that function');
    equals(Function.pipe()(7), 7, 'pipe of no functions is identity');
    return raises((function() {
      return Function.pipe(times2, 7);
    }), 'Raises an exception if argument is not a function');
  });
  test('Function.compose', function() {
    var addten, times2;

    times2 = function(x) {
      return 2 * x;
    };
    addten = function(x) {
      return x + 10;
    };
    equals(Function.compose(times2, addten)(7), 34, 'composition of two functions works');
    equals(Function.compose(addten, times2)(7), 24, 'composition works in opposite direction');
    equals(Function.compose(times2)(7), 14, 'composition of a single function is just that function');
    equals(Function.compose()(7), 7, 'composition of no functions is identity');
    return raises((function() {
      return Function.compose(times2, 7);
    }), 'Raises an exception if argument is not a function');
  });
  module('Aspect-like methods');
  test('Function::pre', function() {
    var a, getA, inc, red;

    a = 0;
    red = function() {
      return 'red';
    };
    inc = function() {
      return a++;
    };
    getA = function() {
      return a;
    };
    equal(red.pre(inc)(), 'red', 'pre does not interfere with function');
    equal(a, 1, 'pre function runs first');
    equal(getA.pre(inc)(), 2, 'pre function runs first');
    return raises((function() {
      return red.pre('fred');
    }), 'Raises an exception if argument is not a function');
  });
  test('post', function() {
    var add, log, logged;

    logged = '';
    log = function(c, a, b) {
      return logged = a + '+' + b + '=' + c;
    };
    add = (function(a, b) {
      return a + b;
    }).post(log);
    equal(add(2, 3), 5, 'Post-function does not affect operation of function');
    equal(logged, '2+3=5', 'Post-function is run and has access to arguments and return value');
    return raises((function() {
      return (function(a, b) {
        return a + b;
      }).post('fred');
    }), 'Raises an exception if argument is not a function');
  });
  module('Preconditions and postconditions');
  test('require', function() {
    var add2, restrictedAdd2, safeAdd2;

    add2 = function(x) {
      return x + 2;
    };
    safeAdd2 = add2.require(Function.argument(0).hastype('number'));
    restrictedAdd2 = add2.require(Function.argument(0).hastype('number')).require(Function.argument(0).between(0, 5));
    equal(safeAdd2(2), 4, 'Works as normal if requirements satisfied');
    raises((function() {
      return safeAdd2('fred');
    }), 'Throws exception if requirements not satisfied');
    equals(restrictedAdd2(2), 4, 'Works as normal if requirments satisfied');
    raises((function() {
      return restrictedAdd2('fred');
    }), 'Throws exception if first requirment unsatisfied');
    return raises((function() {
      return restrictedAdd2(6);
    }), 'Throws exception if second requirment unsatisfied');
  });
  test('ensure', function() {
    var add, faultyAdd, safeAdd, safeFaultyAdd;

    add = function(a, b) {
      return a + b;
    };
    faultyAdd = function(a, b) {
      return a + b + 1;
    };
    safeAdd = add.ensure(function(c, a, b) {
      return c === a + b;
    });
    safeFaultyAdd = faultyAdd.ensure(function(c, a, b) {
      return c === a + b;
    });
    equals(safeAdd(2, 3), 5, 'Works as expected when postcondition satisfied');
    return raises((function() {
      return safeFaultyAdd(2, 3);
    }), 'Throws exception if postcondition unsatisfied');
  });
  module('Typed functions');
  test('Function.Requiring', function() {
    var Person, fred;

    Person = function() {};
    Person.prototype.setAge = Function.Requiring(function(age) {
      return (18 <= age && age <= 65);
    })(function(age) {
      return this.age = age;
    });
    fred = new Person();
    fred.setAge(30);
    equals(fred.age, 30, 'Respects context');
    return raises((function() {
      return fred.setAge(70);
    }), 'Throws exception if argument violates precondition');
  });
  test('Function.From', function() {
    var Person, fred, inc, repeat, _class, _ref;

    inc = Function.From(Number)(function(x) {
      return x + 1;
    });
    equals(inc(3), 4, 'works as untyped function when called with argument of correct type');
    raises((function() {
      return inc('red');
    }), 'raises an exception when called with argument of wrong type');
    repeat = Function.From(Number, String)(function(n, s) {
      var i;

      return ((function() {
        var _i, _results;

        _results = [];
        for (i = _i = 1; 1 <= n ? _i <= n : _i >= n; i = 1 <= n ? ++_i : --_i) {
          _results.push(s);
        }
        return _results;
      })()).join('');
    });
    equals(repeat(3, 'a'), 'aaa', 'works as untyped function when called with arguments of correct type');
    raises((function() {
      return repeat('n', 'a');
    }), 'raises exception when first argument is of wrong type');
    raises((function() {
      return repeat(3, 3);
    }), 'raises exception when second argument is of wrong type');
    Person = (function() {
      function _Class() {
        _ref = _class.apply(this, arguments);
        return _ref;
      }

      _class = Function.From(String)(function(name) {
        this.name = name;
      });

      return _Class;

    })();
    fred = new Person('fred');
    equals(fred.name, 'fred', 'constructor works as untyped constructor when arguments of correct type');
    return raises((function() {
      return new Person(3);
    }), 'constructor raises exception when arguments have wrong type');
  });
  test('Function.To', function() {
    var Entity, add, fred, robot;

    add = Function.To(Number)(function(a, b) {
      return a + b;
    });
    equals(add(2, 3), 5, 'works as untyped function when return value of correct type');
    raises((function() {
      return add('a', 'b');
    }), 'raises exception when return value of wrong type');
    Entity = (function() {
      function _Class(name) {
        this.name = name;
      }

      _Class.prototype.getName = Function.To(String)(function() {
        return this.name;
      });

      return _Class;

    })();
    fred = new Entity('fred');
    robot = new Entity(3);
    equals(fred.getName(), 'fred', 'works as untyped method when return value of correct type');
    return raises((function() {
      return robot.getName();
    }), 'raises exception when return value method has incorrect type');
  });
  test('Function.From.To', function() {
    var inc, inc2;

    inc = Function.From(Number).To(Number)(function(x) {
      if (x === 2) {
        return 'red';
      } else {
        return x + 1;
      }
    });
    inc2 = Function.To(Number).From(Number)(function(x) {
      if (x === 2) {
        return 'red';
      } else {
        return x + 1;
      }
    });
    equals(inc(3), 4, 'works as untyped function when called with argument of correct type and returns correct type');
    raises((function() {
      return inc('red');
    }), 'raises an exception when called with argument of wrong type');
    raises((function() {
      return inc(2);
    }), 'raises an exception when returning wrong type');
    equals(inc2(3), 4, 'works as untyped function when called with argument of correct type and returns correct type, with From and To reversed');
    raises((function() {
      return inc2('red');
    }), 'raises an exception when called with argument of wrong type, with From and To reversed');
    return raises((function() {
      return inc2(2);
    }), 'raises an exception when returning wrong type, with From and To reversed');
  });
  module('Logical functions');
  test('Function::and', function() {
    var comp, gt, lt;

    gt = function(x) {
      return x > 2;
    };
    lt = function(x) {
      return x < 6;
    };
    comp = gt.and(lt);
    equals(comp(4), true, 'true if both conditions true');
    equals(comp(1), false, 'false if first condition false');
    equals(comp(7), false, 'false if second condition false');
    return raises((function() {
      return gt.and(4);
    }), 'raises an exception if argument is not a function');
  });
  test('Function::or', function() {
    var comp, gt, lt;

    gt = function(x) {
      return x > 2;
    };
    lt = function(x) {
      return x < 2;
    };
    comp = gt.or(lt);
    equals(comp(3), true, 'true if first condition true');
    equals(comp(1), true, 'true if second condition true');
    return equals(comp(2), false, 'false if both conditions false');
  });
  test('Function::not', function() {
    var isOdd;

    isOdd = function(x) {
      return x % 2 === 1;
    };
    equals(isOdd(5), true, 'Base function works');
    equals(isOdd.not()(5), false, 'Works as expected when base returns true');
    return equals(isOdd.not()(6), true, 'Works as expected when base returns false');
  });
  test('Function.and', function() {
    equals(Function.and()(5), true, 'or of zero arguments is true');
    equals(Function.and(Function.eq(5))(5), true, 'and with one argument returns true when predicate is true');
    equals(Function.and(Function.eq(5))(7), false, 'and with one argument returns false when predicate is false');
    equals(Function.and(Function.lt(5), Function.lt(6))(3), true, 'and with two arguments returns true when both are true');
    equals(Function.and(Function.eq(5), Function.eq(6))(6), false, 'and with two arguments returns false when first is false');
    equals(Function.and(Function.eq(5), Function.eq(6))(5), false, 'or with two arguments returns false when second is false');
    return equals(Function.and(Function.eq(5), Function.eq(6))(7), false, 'or with two arguments returns false when neither is true');
  });
  test('Function.or', function() {
    equals(Function.or()(5), false, 'or of zero arguments is false');
    equals(Function.or(Function.eq(5))(5), true, 'or with one argument returns true when predicate is true');
    equals(Function.or(Function.eq(5))(7), false, 'or with one argument returns false when predicate is false');
    equals(Function.or(Function.eq(5), Function.eq(6))(5), true, 'or with two arguments returns true when first is true');
    equals(Function.or(Function.eq(5), Function.eq(6))(6), true, 'or with two arguments returns true when second is true');
    return equals(Function.or(Function.eq(5), Function.eq(6))(7), false, 'or with two arguments returns false when neither is true');
  });
  test('Function.not', function() {
    equals(Function.not(Function.eq(5))(6), true, 'not returns true when predicate returns false');
    return equals(Function.not(Function.eq(5))(5), false, 'not returns false when predicate returns true');
  });
  module('Function: Ordering');
  test('Function.asc', function() {});
  module('Comparison predicates');
  test('Function::eq', function() {
    equal(Function.eq(5)(5), true, 'returns true when applied to value equal to argument');
    return equal(Function.eq(5)(3), false, 'returns false when applied to value not equal to argument');
  });
  test('Function::neq', function() {
    equal(Function.neq(5)(3), true, 'returns true when applied to value not equal to argument');
    return equal(Function.neq(5)(5), false, 'returns false when applied to value equal to argument');
  });
  test('Function::lt', function() {
    equal(Function.lt(5)(3), true, 'returns true when applied to value less than argument');
    equal(Function.lt(5)(5), false, 'returns false when applied to value equal to argument');
    return equal(Function.lt(5)(7), false, 'returns false when applied to value greater than argument');
  });
  test('Function::gt', function() {
    equal(Function.gt(5)(3), false, 'returns false when applied to value less than argument');
    equal(Function.gt(5)(5), false, 'returns false when applied to value equal to argument');
    return equal(Function.gt(5)(7), true, 'returns true when applied to value greater than argument');
  });
  test('Function::lte', function() {
    equal(Function.lte(5)(3), true, 'returns true when applied to value less than argument');
    equal(Function.lte(5)(5), true, 'returns true when applied to value equal to argument');
    return equal(Function.lte(5)(7), false, 'returns false when applied to value greater than argument');
  });
  test('Function::gte', function() {
    equal(Function.gte(5)(3), false, 'returns false when applied to value less than argument');
    equal(Function.gte(5)(5), true, 'returns true when applied to value equal to argument');
    return equal(Function.gte(5)(7), true, 'returns true when applied to value greater than argument');
  });
  test('Function::between', function() {
    equal(Function.between(3, 5)(2), false, 'returns false when applied to value less than lower bound');
    equal(Function.between(3, 5)(3), true, 'returns true when applied to value equal to lower bound');
    equal(Function.between(3, 5)(4), true, 'returns true when applied to value strictly between bounds');
    equal(Function.between(3, 5)(5), true, 'returns true when applied to value equal to upper bound');
    equal(Function.between(3, 5)(6), false, 'returns false when applied to value greater than upper bound');
    return raises((function() {
      return Function.between(5, 3);
    }), 'throws exception when lower bound not less or equal to upper bound');
  });
  module('Property methods');
  test('Function::as', function() {
    var fn;

    fn = function() {
      return 'red';
    };
    equals(fn.as('test').displayName, 'test', 'as sets displayName of function');
    return equals(fn.as('test')(), 'red', 'function runs normally after use of "as"');
  });
  test('Function::extend', function() {
    var fn;

    fn = function() {
      return 'red';
    };
    equals(fn.extend({
      type: 'accessor'
    }).type, 'accessor', 'extend sets properties of function');
    return equals(fn.extend({
      type: 'accessor'
    })(), 'red', 'function runs normally after use of "extend"');
  });
  module('Application methods');
  test('Function::bind', function() {
    var getName, person;

    person = {
      name: 'fred'
    };
    getName = function() {
      return this.name;
    };
    return equals(getName.bind(person)(), 'fred', 'bind works');
  });
  test('Function::curry', function() {
    var add;

    add = function(a, b) {
      return a + b;
    };
    return equals(add.curry(3)(5), 8, 'curry works');
  });
  test('Function::except', function() {
    var faulty, handled;

    faulty = function() {
      throw 'bang!';
    };
    handled = faulty.except(function(err) {
      return 'Error: ' + err;
    });
    return equal(handled(), 'Error: bang!', 'except works correctly in simplest case');
  });
  test('Function::memo', function() {
    var add;

    add = (function(a, b) {
      return a + b;
    }).memo();
    equals(add(2, 3), 5, 'memoized function works normally on first call');
    return equals(add(2, 3), 5, 'memoized function works normally on subsequent calls');
  });
  module('Mapping methods');
  test('Function::map', function() {
    var mod2, oddEven;

    mod2 = function(x) {
      return x % 2;
    };
    oddEven = mod2.map({
      0: 'even',
      1: 'odd'
    });
    equal(oddEven(6), 'even', 'Works for first mapping entry');
    return equal(oddEven(7), 'odd', 'Works for second mapping entry');
  });
  module('Number');
  test('Integer', function() {
    equals(Integer(5), 5, 'Returns the integer value when called on an integer.');
    return raises((function() {
      return Integer(5.5);
    }), 'Throws an exception when called on a non-integer');
  });
  module('Nullable');
  return test('Nullable Number', function() {
    equals((Nullable(Number))(null), null, 'Returns null when called on null.');
    return equals((Nullable(Number))(5), 5, 'Throws an exception when called on a non-integer');
  });
});

/*
//@ sourceMappingURL=test-opal2.map
*/
