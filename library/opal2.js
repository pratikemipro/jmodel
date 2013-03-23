// Generated by CoffeeScript 1.6.2
/*
	Opal JavaScript Library
	http://code.google.com/p/jmodel/

	Copyright (c) 2009-2013 Richard Baker
	Dual licensed under the MIT and GPL licenses
*/

var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(function() {
  var _base, _ref;

  Array.concat = function() {
    var arrays, _ref;

    arrays = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = []).concat.apply(_ref, arrays);
  };
  Array.zip = function() {
    var arr, arrays, i, maxIndex, _i, _results;

    arrays = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (arrays.length === 0) {
      return [];
    }
    maxIndex = Math.min.apply(Math, (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = arrays.length; _i < _len; _i++) {
        arr = arrays[_i];
        _results.push(arr.length - 1);
      }
      return _results;
    })());
    _results = [];
    for (i = _i = 0; 0 <= maxIndex ? _i <= maxIndex : _i >= maxIndex; i = 0 <= maxIndex ? ++_i : --_i) {
      _results.push((function() {
        var _j, _len, _results1;

        _results1 = [];
        for (_j = 0, _len = arrays.length; _j < _len; _j++) {
          arr = arrays[_j];
          _results1.push(arr[i]);
        }
        return _results1;
      })());
    }
    return _results;
  };
  Array.flatten = function(array) {
    var arr;

    if (array == null) {
      array = [];
    }
    return Array.concat.apply(Array, (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        arr = array[_i];
        _results.push(arr instanceof Array ? Array.flatten(arr) : arr);
      }
      return _results;
    })());
  };
  Array.hastypes = function() {
    var predicates, type, types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    predicates = (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _results.push(Object.isa(type));
      }
      return _results;
    })();
    return function(array) {
      var i, valid, x, _i, _len;

      if (array.length !== predicates.length) {
        return false;
      }
      valid = true;
      for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
        x = array[i];
        valid = valid && predicates[i](x);
      }
      return valid;
    };
  };
  Object.extend = function(target, source) {
    var key;

    for (key in source) {
      if (!__hasProp.call(source, key)) continue;
      target[key] = source[key];
    }
    return target;
  };
  Object.construct = function() {
    var args1, constructor;

    constructor = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (constructor === Number || constructor === String || constructor === Boolean) {
      return constructor;
    } else if (constructor === Date) {
      return function() {
        var args, args2;

        args2 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args = Array.concat(args1, args2);
        switch (args.length) {
          case 1:
            return new Date(args[0]);
          case 3:
            return new Date(args[0], args[1], args[2]);
          case 7:
            return new Date(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        }
      };
    } else {
      return function() {
        var args, args2;

        args2 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args = Array.concat(args1, args2);
        return (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(constructor, args, function(){});
      };
    }
  };
  Object.isa = function(constructor) {
    if (constructor === Number) {
      return function(obj) {
        return obj instanceof Number || typeof obj === 'number';
      };
    } else if (constructor === String) {
      return function(obj) {
        return obj instanceof String || typeof obj === 'string';
      };
    } else if (constructor === Boolean) {
      return function(obj) {
        return obj instanceof Boolean || typeof obj === 'boolean';
      };
    } else {
      return function(obj) {
        return obj instanceof constructor;
      };
    }
  };
  Object.ensure = function(constructor) {
    var construct, isa;

    isa = Object.isa(constructor);
    construct = Object.construct.apply(Object, arguments);
    return function(obj) {
      if (isa(obj)) {
        return obj;
      } else {
        return construct.apply(null, arguments);
      }
    };
  };
  Object.copy = function(obj) {
    return Object.extend({}, obj);
  };
  Function.identity = function(x) {
    return x;
  };
  Function.constant = function(constant) {
    return function() {
      return constant;
    };
  };
  Function.argument = function(n) {
    return function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return args[n];
    };
  };
  Function.map = function(mapping) {
    return function(key) {
      return mapping[key];
    };
  };
  Function.prototype.then = function(fn2) {
    var fn1;

    if (typeof fn2 !== 'function') {
      throw 'Precondition failure';
    }
    fn1 = this;
    return function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return fn2.call(this, fn1.apply(this, args));
    };
  };
  Function.prototype.but = function(fn2) {
    var fn1;

    if (typeof fn2 !== 'function') {
      throw 'Precondition failure';
    }
    fn1 = this;
    return function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      fn1.apply(this, args);
      return fn2.apply(this, args);
    };
  };
  Function.pipe = function() {
    var fn, fns, _ref;

    fn = arguments[0], fns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((_ref = typeof fn) !== 'function' && _ref !== 'undefined') {
      throw 'Precondition failure';
    }
    switch (arguments.length) {
      case 1:
        return fn;
      case 0:
        return Function.identity;
      default:
        return fn.then(Function.pipe.apply(Function, fns));
    }
  };
  Function.compose = function() {
    var fn, fns, _ref;

    fn = arguments[0], fns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((_ref = typeof fn) !== 'function' && _ref !== 'undefined') {
      throw 'Precondition failure';
    }
    switch (arguments.length) {
      case 1:
        return fn;
      case 0:
        return Function.identity;
      default:
        return Function.pipe.apply(Function, (Array.concat.apply(Array, arguments)).reverse());
    }
  };
  Function.prototype.pre = function(pre) {
    if (typeof pre !== 'function') {
      throw 'Precondition failure';
    }
    return pre.but(this);
  };
  Function.prototype.post = function(post) {
    var fn;

    if (typeof post !== 'function') {
      throw 'Precondition failure';
    }
    fn = this;
    return function() {
      var args, ret;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ret = fn.apply(this, args);
      post.apply(this, [ret].concat(args));
      return ret;
    };
  };
  Function.prototype.require = function(predicate) {
    return this.pre(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!predicate.apply(this, args)) {
        throw 'Precondition failure';
      }
    });
  };
  Function.prototype.ensure = function(predicate) {
    return this.post(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!predicate.apply(this, args)) {
        throw 'Postcondition failure';
      }
    });
  };
  Function.hastypes = function() {
    var predicate, types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    predicate = Array.hastypes.apply(Array, types);
    return function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return predicate(args);
    };
  };
  Function.prototype.Requiring = function(predicate) {
    return this.then(function(fn) {
      return fn.require(predicate);
    });
  };
  Function.Requiring = function(predicate) {
    return function(fn) {
      return fn.require(predicate);
    };
  };
  Function.prototype.Ensuring = function(predicate) {
    return this.then(function(fn) {
      return fn.ensure(predicate);
    });
  };
  Function.Ensuring = function(predicate) {
    return function(fn) {
      return fn.ensure(predicate);
    };
  };
  Function.prototype.From = function() {
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.Requiring(Function.hastypes.apply(Function, types));
  };
  Function.From = function() {
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.Requiring(Function.hastypes.apply(Function, types));
  };
  Function.prototype.To = function(type) {
    return this.Ensuring(Object.isa(type));
  };
  Function.To = function(type) {
    return Function.Ensuring(Object.isa(type));
  };
  window.Predicate = Function.To(Boolean);
  Function.prototype.and = Function.From(Function)(function(predicate2) {
    var predicate1;

    predicate1 = this;
    return Predicate(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return predicate1.apply(this, args) && predicate2.apply(this, args);
    });
  });
  Function.prototype.or = Function.From(Function)(function(predicate2) {
    var predicate1;

    predicate1 = this;
    return Predicate(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return predicate1.apply(this, args) || predicate2.apply(this, args);
    });
  });
  Function.prototype.not = function() {
    var predicate;

    predicate = this;
    return Predicate(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return !predicate.apply(this, args);
    });
  };
  Function.and = function() {
    var predicate, predicates;

    predicate = arguments[0], predicates = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    switch (arguments.length) {
      case 1:
        return predicate;
      case 0:
        return function() {
          return true;
        };
      default:
        return predicate.and(Function.and.apply(Function, predicates));
    }
  };
  Function.or = function() {
    var predicate, predicates;

    predicate = arguments[0], predicates = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    switch (arguments.length) {
      case 1:
        return predicate;
      case 0:
        return function() {
          return false;
        };
      default:
        return predicate.or(Function.or.apply(Function, predicates));
    }
  };
  Function.not = function(predicate) {
    if (typeof predicate === 'function') {
      return predicate.not();
    } else {
      return !predicate;
    }
  };
  Function.ordering = Function.or;
  Function.eq = function(value) {
    return Predicate(function(x) {
      return x === value;
    });
  };
  Function.neq = function(value) {
    return Predicate(function(x) {
      return x !== value;
    });
  };
  Function.lt = function(value) {
    return Predicate(function(x) {
      return x < value;
    });
  };
  Function.gt = function(value) {
    return Predicate(function(x) {
      return x > value;
    });
  };
  Function.lte = function(value) {
    return Predicate(function(x) {
      return x <= value;
    });
  };
  Function.gte = function(value) {
    return Predicate(function(x) {
      return x >= value;
    });
  };
  Function.between = (Function.Requiring(function(lower, higher) {
    return lower <= higher;
  }))(function(lower, higher) {
    return Predicate(function(x) {
      return (lower <= x && x <= higher);
    });
  });
  Function.prototype.as = function(name) {
    this.displayName = name;
    return this;
  };
  Function.prototype.extend = function(properties) {
    return Object.extend(this, properties);
  };
  Function.prototype.bind = function() {
    var args1, context, fn;

    context = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    fn = this;
    return function() {
      var args2;

      args2 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return fn.apply(context, Array.concat(args1, args2));
    };
  };
  Function.prototype.curry = function() {
    var args1, fn;

    args1 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    fn = this;
    return function() {
      var args2;

      args2 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return fn.apply(this, Array.concat(args1, args2));
    };
  };
  Function.prototype.except = function(handler) {
    var fn;

    fn = this;
    return function() {
      var args, error;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      try {
        return fn.apply(this, args);
      } catch (_error) {
        error = _error;
        return handler.call(this, error);
      }
    };
  };
  Function.prototype.memo = function() {
    var cache, fn;

    cache = {};
    fn = this.post(function() {
      var args, ret;

      ret = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return cache[args] = ret;
    });
    return function() {
      var args, _ref;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = cache[args]) != null ? _ref : fn.apply(this, arguments);
    };
  };
  if ((_ref = (_base = Function.prototype).delay) == null) {
    _base.delay = function() {
      var args1, duration, fn;

      duration = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (duration == null) {
        duration = 1;
      }
      fn = this;
      return function() {
        var args2;

        args2 = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return setTimeout(fn.curry.apply(fn, Array.concat(args1, args2)), duration);
      };
    };
  }
  Function.prototype.map = function(mapping) {
    return this.then(Function.map(mapping));
  };
  Function.prototype.is = Function.prototype.then;
  Function.prototype.eq = function(value) {
    return this.then(Function.eq(value));
  };
  Function.prototype.neq = function(value) {
    return this.then(Function.neq(value));
  };
  Function.prototype.lt = function(value) {
    return this.then(Function.lt(value));
  };
  Function.prototype.gt = function(value) {
    return this.then(Function.gt(value));
  };
  Function.prototype.lte = function(value) {
    return this.then(Function.lte(value));
  };
  Function.prototype.gte = function(value) {
    return this.then(Function.gte(value));
  };
  Function.prototype.between = function(lower, higher) {
    return this.then(Function.between(lower, higher));
  };
  Function.prototype.matches = function(regex) {
    return this.then(Predicate(function(x) {
      return regex.test(x);
    }));
  };
  Function.prototype.isnull = function() {
    return this.then(Function.eq(null));
  };
  Function.prototype.isa = function(constructor) {
    return this.then(Predicate(function(x) {
      return x instanceof constructor;
    }));
  };
  Function.prototype.hastype = function(type) {
    return this.then(Predicate(function(x) {
      return typeof x === type;
    }));
  };
  Function.prototype.asc = function() {
    var fn;

    fn = this;
    return function(a, b) {
      var fna, fnb;

      fna = fn.call(this, a);
      fnb = fn.call(this, b);
      if (fna < fnb) {
        return -1;
      }
      if (fna > fnb) {
        return 1;
      }
      return 0;
    };
  };
  Function.prototype.desc = function() {
    return this.asc().then(function(x) {
      return -x;
    });
  };
  Function.prototype.create = function() {
    var args;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Object.construct(this).apply(null, args);
  };
  Function.prototype.Where = function(predicate, message) {
    var property, restricted, value, _ref1;

    if (message == null) {
      message = 'Invalid value';
    }
    restricted = this.post(function(value) {
      if (!predicate(value)) {
        throw message.replace('<value>', value);
      }
    });
    restricted.base = this.base || this;
    restricted.__predicate = predicate;
    _ref1 = restricted.base;
    for (property in _ref1) {
      value = _ref1[property];
      restricted[property] = value;
    }
    return restricted;
  };
  Object.equal = Predicate.From(Object, Object)(function(a, b) {
    var equal, prop;

    equal = true;
    for (prop in a) {
      if (!__hasProp.call(a, prop)) continue;
      equal && (equal = a[prop] === b[prop]);
    }
    for (prop in b) {
      if (!__hasProp.call(b, prop)) continue;
      equal && (equal = a[prop] === b[prop]);
    }
    return equal;
  });
  Object.remove = function() {
    var fields;

    fields = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.From(Object).To(Object)(function(source) {
      var key, obj, value;

      obj = {};
      for (key in source) {
        if (!__hasProp.call(source, key)) continue;
        value = source[key];
        if (__indexOf.call(fields, key) < 0) {
          obj[key] = value;
        }
      }
      return obj;
    });
  };
  Object.project = function() {
    var fields;

    fields = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.From(Object).To(Object)(function(source) {
      var key, obj, value;

      obj = {};
      for (key in source) {
        if (!__hasProp.call(source, key)) continue;
        value = source[key];
        if (__indexOf.call(fields, key) >= 0) {
          obj[key] = value;
        }
      }
      return obj;
    });
  };
  Object.rename = function(renaming) {
    return Function.From(Object).To(Object)(function(source) {
      var key, obj, value;

      obj = {};
      for (key in source) {
        if (!__hasProp.call(source, key)) continue;
        value = source[key];
        obj[renaming[key] || key] = value;
      }
      return obj;
    });
  };
  Object.union = function() {
    var first, rest;

    first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    switch (arguments.length) {
      case 1:
        return first;
      case 0:
        return {};
      default:
        return Object.extend(Object.copy(first), Object.union.apply(Object, rest));
    }
  };
  Object.intersection = function() {
    var objects;

    objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  };
  Object.difference = function(a, b) {};
  Object.join = function(predicate) {};
  Number.__predicate = function(value) {
    return value instanceof Number || typeof value === 'number';
  };
  Number.LessThan = function(max) {
    return this.Where(Function.lt(max), "Invalid Value: <value> is not less than " + max);
  };
  Number.GreaterThan = function(min) {
    return this.Where(Function.gt(min), "Invalid Value: <value> is not greater than " + min);
  };
  Number.Between = function(min, max) {
    return this.Where(Function.between(min, max), "Invalid Value: <value> is not between " + min + " and " + max);
  };
  window.Integer = Number.Where(function(value) {
    return value === Math.round(value);
  }, "Invalid Value: <value> is not an integer");
  Number.Positive = Number.GreaterThan(0);
  Number.Negative = Number.LessThan(0);
  String.__predicate = Object.isa(String);
  String.In = function() {
    var string, strings;

    strings = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.Where(function(str) {
      return __indexOf.call(strings, str) >= 0;
    }, "Invalid String: \"<value>\" is not in {" + (((function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        string = strings[_i];
        _results.push('\"' + string + '\"');
      }
      return _results;
    })()).join(',')) + "}");
  };
  String.Matching = function(regex) {
    return this.Where(function(str) {
      return regex.test(str);
    }, "Invalid String: \"<value>\" does not match " + (regex.toString()));
  };
  return window.Nullable = function(constructor) {
    var construct;

    construct = Object.construct(constructor);
    return function(x) {
      if (arguments.length === 1 && x === null) {
        return null;
      } else {
        return construct.apply(null, arguments);
      }
    };
  };
});

/*
//@ sourceMappingURL=opal2.map
*/
