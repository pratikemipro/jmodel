// Generated by CoffeeScript 1.4.0

define(['jmodel/opal2'], function() {
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
    return deepEqual(red.then(green.then(blue))([]), red.then(green).then(blue)([]), 'then is associative');
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
    return deepEqual(arr, ['red'], 'first function has been applied');
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
    return equals(Function.pipe()(7), 7, 'pipe of no functions is identity');
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
    return equals(Function.compose()(7), 7, 'composition of no functions is identity');
  });
  module('Logical functions');
  test('Function::or', function() {
    equals(Function.or()(5), false, 'or of zero arguments is false');
    equals(Function.or(Function.eq(5))(5), true, 'or with one argument returns true when predicate is true');
    equals(Function.or(Function.eq(5))(7), false, 'or with one argument returns false when predicate is false');
    equals(Function.or(Function.eq(5), Function.eq(6))(5), true, 'or with two arguments returns true when first is true');
    equals(Function.or(Function.eq(5), Function.eq(6))(6), true, 'or with two arguments returns true when second is true');
    return equals(Function.or(Function.eq(5), Function.eq(6))(7), false, 'or with two arguments returns false when neither is true');
  });
  test('Function::and', function() {
    equals(Function.and()(5), true, 'or of zero arguments is true');
    equals(Function.and(Function.eq(5))(5), true, 'and with one argument returns true when predicate is true');
    equals(Function.and(Function.eq(5))(7), false, 'and with one argument returns false when predicate is false');
    equals(Function.and(Function.lt(5), Function.lt(6))(3), true, 'and with two arguments returns true when both are true');
    equals(Function.and(Function.eq(5), Function.eq(6))(6), false, 'and with two arguments returns false when first is false');
    equals(Function.and(Function.eq(5), Function.eq(6))(5), false, 'or with two arguments returns false when second is false');
    return equals(Function.and(Function.eq(5), Function.eq(6))(7), false, 'or with two arguments returns false when neither is true');
  });
  test('Function::not', function() {
    equals(Function.not(Function.eq(5))(6), true, 'not returns true when predicate returns false');
    return equals(Function.not(Function.eq(5))(5), false, 'not returns false when predicate returns true');
  });
  module('Aspect-like methods');
  module('Preconditions and postconditions');
  module('Typed functions');
  test('Function.From', function() {
    var Person, fred, inc, repeat, _class;
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
        return _class.apply(this, arguments);
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
  module('Number');
  return test('Integer', function() {
    equals(Integer(5), 5, 'Returns the integer value when called on an integer.');
    return raises((function() {
      return Integer(5.5);
    }), 'Throws an exception when called on a non-integer');
  });
});
