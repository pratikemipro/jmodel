// Generated by CoffeeScript 1.4.0

define(['jmodel/opal2'], function() {
  module('Function');
  test('identity', function() {
    var obj;
    obj = {
      name: 'test'
    };
    equals(Function.identity(obj), obj, 'Works for objects');
    return equals(Function.identity(17), 17, 'Words for bare values');
  });
  test('constant', function() {
    var fred;
    fred = Function.constant('fred');
    equals(fred(), 'fred', 'Works with no arguments');
    return equals(fred(1, 2, 3), 'fred', 'Works with arguments');
  });
  test('argument', function() {
    equals(Function.argument(0).call(this, 'red', 'green', 'blue'), 'red', 'Function.argument(0) works');
    equals(Function.argument(1).call(this, 'red', 'green', 'blue'), 'green', 'Function.argument(1) works');
    equals(Function.argument(2).call(this, 'red', 'green', 'blue'), 'blue', 'Function.argument(2) works');
    return equals(Function.argument(4).call(this, 'red', 'green', 'blue'), void 0, 'Function.argument(4) returns undefined if beyond bounds');
  });
  return test('map', function() {
    var counts;
    counts = Function.map({
      quarks: 6,
      chargedLeptons: 3,
      neutrinos: 3
    });
    equals(counts('quarks'), 6, 'Works for first mapping entry');
    return equals(counts('chargedLeptons'), 3, 'Works for other mapping entries');
  });
});
