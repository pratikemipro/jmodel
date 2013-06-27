// Generated by CoffeeScript 1.6.2
/*
		Opal JavaScript Library
		http://code.google.com/p/jmodel/

		Copyright (c) 2009-2013 Richard Baker
		Dual licensed under the MIT and GPL licenses
*/

var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function() {
  var Promise, Type, ordered, _base, _ref, _ref1;

  window.Value = function() {};
  window.Value.valid = function(x) {
    return x !== void 0;
  };
  Object.isa = function(constructor) {
    switch (false) {
      case constructor !== Number:
        return function(obj) {
          return obj instanceof Number || typeof obj === 'number';
        };
      case constructor !== String:
        return function(obj) {
          return obj instanceof String || typeof obj === 'string';
        };
      case constructor !== Boolean:
        return function(obj) {
          return obj instanceof Boolean || typeof obj === 'boolean';
        };
      case constructor !== Value:
        return function(obj) {
          return obj !== void 0;
        };
      case constructor.valid == null:
        return function(obj) {
          return constructor.valid(obj);
        };
      default:
        return function(obj) {
          return obj instanceof constructor;
        };
    }
  };
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
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return function(array) {
      var array2, type, types2, value;

      if (array == null) {
        array = [];
      }
      if (types.length === 0 && array.length === 0) {
        return true;
      }
      types2 = types.slice(0);
      array2 = array.slice(0);
      value = void 0;
      while (type = types2.shift()) {
        if (type instanceof Array) {
          type = type[0];
          while (array2.length > 0 && Object.isa(type)(array2[0])) {
            array2.shift();
          }
        } else {
          value = array2.shift();
          if (!Object.isa(type)(value)) {
            return false;
          }
        }
      }
      return types2.length === 0 && array2.length === 0;
    };
  };
  Function.prototype.extend = function(properties) {
    return Object.extend(this, properties);
  };
  Function.identity = function(x) {
    return x;
  };
  Function.constant = function(constant) {
    return function() {
      return constant;
    };
  };
  Function["arguments"] = function() {
    var args;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return args;
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
  Function["switch"] = function(variants) {
    var fn;

    if (variants == null) {
      variants = [];
    }
    fn = function() {
      var args, variant, _i, _len;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = variants.length; _i < _len; _i++) {
        variant = variants[_i];
        if (variant.test.apply(variant, args)) {
          return variant.apply(this, args);
        }
      }
      return void 0;
    };
    return fn.extend({
      extend: function(variants2) {
        if (variants2 == null) {
          variants2 = [];
        }
        return Function["switch"](variants2.concat(variants));
      }
    });
  };
  window.Type = Type = function() {
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return function(fn) {
      return fn.extend({
        test: Function.hastypes.apply(Function, types)
      });
    };
  };
  Function.Constant = function(constant) {
    return function(fn) {
      return function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        fn.apply(this, args);
        return constant;
      };
    };
  };
  Function.Override = Function.Constant(false);
  Function.Chaining = function(fn) {
    return function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      fn.apply(this, args);
      return this;
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
  Function.prototype.require = function(predicate, message) {
    if (message == null) {
      message = 'Precondition failure';
    }
    return this.pre(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!predicate.apply(this, args)) {
        throw message + ': ' + args.toString();
      }
    });
  };
  Function.prototype.ensure = function(predicate, message) {
    if (message == null) {
      message = 'Postcondition failure';
    }
    return this.post(function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!predicate.apply(this, args)) {
        throw message + ': ' + args.toString();
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
  Function.prototype.Requiring = function(predicate, message) {
    return this.then(function(fn) {
      return fn.require(predicate, message);
    });
  };
  Function.Requiring = function(predicate, message) {
    return function(fn) {
      return fn.require(predicate, message);
    };
  };
  Function.prototype.Ensuring = function(predicate, message) {
    return this.then(function(fn) {
      return fn.ensure(predicate, message);
    });
  };
  Function.Ensuring = function(predicate, message) {
    return function(fn) {
      return fn.ensure(predicate, message);
    };
  };
  Function.prototype.From = function() {
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.Requiring(Function.hastypes.apply(Function, types), 'Incorrect source type. Arguments are');
  };
  Function.From = function() {
    var types;

    types = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.Requiring(Function.hastypes.apply(Function, types), 'Incorrect source type. Arguments are');
  };
  Function.prototype.To = function(type) {
    return this.Ensuring(Object.isa(type), 'Incorrect target type. Returned value is');
  };
  Function.To = function(type) {
    return Function.Ensuring(Object.isa(type), 'Incorrect target type. Returned value is');
  };
  Function.Of = function(constructor) {
    var ensure;

    ensure = Object.ensure(constructor);
    return function(fn) {
      return function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return fn.call(this, ensure.apply(null, args));
      };
    };
  };
  Function.Returning = function(val) {
    return function(fn) {
      return function() {
        var args, ret;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ret = val.call(this);
        fn.call(this, ret).apply(this, args);
        return ret;
      };
    };
  };
  Function.prototype.Returning = function(val) {
    return Function.Returning(val).then(this);
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
  Function.and = Function.From([Function]).To(Function)(function() {
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
  });
  Function.or = Function.From([Function]).To(Function)(function() {
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
  });
  Function.not = function(predicate) {
    if (typeof predicate === 'function') {
      return predicate.not();
    } else {
      return !predicate;
    }
  };
  Function.delegate = function(fn) {
    return function() {
      var args, context, method, _ref;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = fn.call(this), context = _ref[0], method = _ref[1];
      return method.apply(context, args);
    };
  };
  Function.ordering = Function.or;
  Function.eq = function(value) {
    return Predicate(function(x) {
      return x === value;
    });
  };
  Function.prototype.eq = function(value) {
    return this.then(Function.eq(value));
  };
  Function.neq = function(value) {
    return Predicate(function(x) {
      return x !== value;
    });
  };
  Function.prototype.neq = function(value) {
    return this.then(Function.neq(value));
  };
  Function.lt = function(value) {
    return Predicate(function(x) {
      return x < value;
    });
  };
  Function.prototype.lt = function(value) {
    return this.then(Function.lt(value));
  };
  Function.gt = function(value) {
    return Predicate(function(x) {
      return x > value;
    });
  };
  Function.prototype.gt = function(value) {
    return this.then(Function.gt(value));
  };
  Function.lte = function(value) {
    return Predicate(function(x) {
      return x <= value;
    });
  };
  Function.prototype.lte = function(value) {
    return this.then(Function.lte(value));
  };
  Function.gte = function(value) {
    return Predicate(function(x) {
      return x >= value;
    });
  };
  Function.prototype.gte = function(value) {
    return this.then(Function.gte(value));
  };
  ordered = function(lower, higher) {
    return lower <= higher;
  };
  Function.between = (Function.Requiring(ordered))(function(lower, higher) {
    return Predicate(function(x) {
      return (lower <= x && x <= higher);
    });
  });
  Function.prototype.between = function(lower, higher) {
    return this.then(Function.between(lower, higher));
  };
  Function.prototype.is = Function.prototype.then;
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
    return this.then(Object.type.eq(type));
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
    _ref1 = restricted.base;
    for (property in _ref1) {
      value = _ref1[property];
      restricted[property] = value;
    }
    restricted.valid = Object.isa(restricted.base).and(predicate);
    return restricted;
  };
  Object.extend = Function.From(Object, Object).To(Object)(function(target, source) {
    var key;

    for (key in source) {
      if (!__hasProp.call(source, key)) continue;
      target[key] = source[key];
    }
    return target;
  });
  Object.construct = function() {
    var args1, constructor;

    constructor = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    switch (false) {
      case constructor !== Number && constructor !== String && constructor !== Boolean:
        return constructor;
      case constructor !== Date:
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
      default:
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
  Object.valid = function(constructor) {
    switch (constructor) {
      case Number:
        return function(number) {
          return Object.isa(Number)(number) && !isNan(number);
        };
      case Date:
        return function(date) {
          return Object.isa(Date)(date) && date.toString() !== 'Invalid Date';
        };
      default:
        return Object.isa(constructor);
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
  Object.type = function(obj) {
    return typeof obj;
  };
  Object.eq = function(value) {
    return function(object) {
      return object === value;
    };
  };
  if ((_ref1 = Object.keys) == null) {
    Object.keys = Function.From(Object).To(Array)(function(object) {
      var key, _results;

      _results = [];
      for (key in object) {
        if (!__hasProp.call(object, key)) continue;
        _results.push(key);
      }
      return _results;
    });
  }
  Object.property = function(property, value) {
    switch (arguments.length) {
      case 1:
        return function(obj) {
          return obj[property];
        };
      case 2:
        return function(obj) {
          if (!obj[property]) {
            throw 'Undefined property';
          }
          obj[property] = value;
          return obj;
        };
    }
  };
  Object.method = function() {
    var args1, method;

    method = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function() {
      var args2, obj;

      obj = arguments[0], args2 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!obj[method]) {
        throw 'Undefined method';
      }
      return obj[method].apply(obj, Array.concat(args1, args2));
    };
  };
  Object.resolve = function() {
    var args1, name;

    name = arguments[0], args1 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function() {
      var args2, obj;

      obj = arguments[0], args2 = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!obj[name]) {
        return void 0;
      }
      if (typeof obj[name] === 'function') {
        return Object.method.apply(Object, [name].concat(__slice.call((Array.concat(args1, args2)))))(obj);
      } else {
        return Object.property.apply(Object, [name].concat(__slice.call((Array.concat(args1, args2)))))(obj);
      }
    };
  };
  Object.path = function(path, separator) {
    var first, rest;

    if (path == null) {
      path = [];
    }
    if (separator == null) {
      separator = '.';
    }
    if (typeof path === 'string') {
      return Object.path(path.split(separator));
    }
    first = path[0], rest = 2 <= path.length ? __slice.call(path, 1) : [];
    switch (path.length) {
      case 0:
        return Function.constant(void 0);
      case 1:
        return Object.resolve(first);
      default:
        return Object.resolve(first).then(Object.path(rest));
    }
  };
  Object.has = function() {
    var args;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Object.resolve.apply(null, args).then(Boolean);
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
  Object.remove = Function.From([String])(function() {
    var fields;

    fields = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.From(Object).Returning(function() {
      return new Object;
    })(function(obj) {
      return function(source) {
        var key, value, _results;

        _results = [];
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          value = source[key];
          _results.push(__indexOf.call(fields, key) < 0 ? obj[key] = value : void 0);
        }
        return _results;
      };
    });
  });
  Object.project = Function.From([String])(function() {
    var fields;

    fields = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.From(Object).Returning(function() {
      return new Object;
    })(function(obj) {
      return function(source) {
        var key, value, _results;

        _results = [];
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          value = source[key];
          _results.push(__indexOf.call(fields, key) >= 0 ? obj[key] = value : void 0);
        }
        return _results;
      };
    });
  });
  Object.rename = Function.From(Object)(function(renaming) {
    return Function.From(Object).Returning(function() {
      return new Object;
    })(function(obj) {
      return function(source) {
        var key, value, _results;

        _results = [];
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          value = source[key];
          _results.push(obj[renaming[key] || key] = value);
        }
        return _results;
      };
    });
  });
  Object.union = Function.From([Object]).Returning(function() {
    return new Object;
  })(function(union) {
    return function() {
      var key, object, objects, value, _i, _len, _results;

      objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        _results.push((function() {
          var _results1;

          _results1 = [];
          for (key in object) {
            if (!__hasProp.call(object, key)) continue;
            value = object[key];
            _results1.push(union[key] = value);
          }
          return _results1;
        })());
      }
      return _results;
    };
  });
  Object.intersection = Function.From([Object]).Returning(function() {
    return new Object;
  })(function(intersection) {
    return function() {
      var first, key, object, rest, value, _results;

      first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (first == null) {
        first = {};
      }
      _results = [];
      for (key in first) {
        if (!__hasProp.call(first, key)) continue;
        value = first[key];
        if ([true].concat((function() {
          var _i, _len, _results1;

          _results1 = [];
          for (_i = 0, _len = rest.length; _i < _len; _i++) {
            object = rest[_i];
            _results1.push(__indexOf.call(Object.keys(object), key) >= 0);
          }
          return _results1;
        })()).reduce(function(a, b) {
          return a && b;
        })) {
          _results.push(intersection[key] = value);
        }
      }
      return _results;
    };
  });
  Object.difference = Function.From(Object, Object).Returning(function() {
    return new Object;
  })(function(difference) {
    return function(first, second) {
      var key, value, _results;

      _results = [];
      for (key in first) {
        if (!__hasProp.call(first, key)) continue;
        value = first[key];
        if (second[key] == null) {
          _results.push(difference[key] = value);
        }
      }
      return _results;
    };
  });
  Object.join = Function.From(Function)(function(predicate) {
    return Function.From([Object])(function() {
      var objects;

      objects = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (predicate.apply(null, objects)) {
        return Object.union.apply(Object, objects);
      }
    });
  });
  Number.valid = function(value) {
    return Object.isa(Number)(value) && !isNaN(value);
  };
  Number.In = Function.From([Number]).To(Function)(function() {
    var number, numbers;

    numbers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.Where(function(number) {
      return __indexOf.call(numbers, number) >= 0;
    }, "Invalid Number: \"<value>\" is not in {" + (((function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = numbers.length; _i < _len; _i++) {
        number = numbers[_i];
        _results.push(number);
      }
      return _results;
    })()).join(',')) + "}");
  });
  Number.LessThan = Function.From(Number).To(Function)(function(max) {
    return this.Where(Function.lt(max), "Invalid Value: <value> is not less than " + max);
  });
  Number.GreaterThan = Function.From(Number).To(Function)(function(min) {
    return this.Where(Function.gt(min), "Invalid Value: <value> is not greater than " + min);
  });
  Number.Between = Function.From(Number, Number).To(Function)(function(min, max) {
    return this.Where(Function.between(min, max), "Invalid Value: <value> is not between " + min + " and " + max);
  });
  Number.Integer = Number.Where((function(value) {
    return value === Math.round(value);
  }), "Invalid Value: <value> is not an integer");
  Number.Positive = Number.GreaterThan(0);
  Number.Negative = Number.LessThan(0);
  Number.Odd = Number.Integer.Where((function(number) {
    return number % 2 === 1;
  }), "Invalid Value: <value> is not odd");
  Number.Even = Number.Integer.Where((function(number) {
    return number % 2 === 0;
  }), "Invalid Value: <value> is not even");
  String.concat = Function.From([String]).To(String)(function() {
    var first, rest;

    first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (first == null) {
      first = '';
    }
    return first.concat.apply(first, rest);
  });
  String.concat.unit = '';
  String.In = Function.From([String]).To(Function)(function() {
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
  });
  String.Matching = Function.From(RegExp).To(Function)(function(regex) {
    return this.Where(function(str) {
      return regex.test(str);
    }, "Invalid String: \"<value>\" does not match " + (regex.toString()));
  });
  Boolean.True = function() {
    return true;
  };
  Boolean.True.valid = Object.isa(Boolean).and(function(value) {
    return value;
  });
  Boolean.False = function() {
    return false;
  };
  Boolean.False.valid = Object.isa(Boolean).and(function(value) {
    return !value;
  });
  Math.plus = function(a, b) {
    return a + b;
  };
  Math.plus.unit = 0;
  Math.times = function(a, b) {
    return a * b;
  };
  Math.times.unit = 1;
  window.Nullable = function(constructor) {
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
  window.Maybe = function(base) {
    var construct, derived, valid;

    construct = Object.construct(base);
    valid = Object.isa(base);
    derived = function(x) {
      if (arguments.length === 0 || (x == null)) {
        return void 0;
      } else {
        return construct.apply(null, arguments);
      }
    };
    derived.valid = function(x) {
      return (x == null) || valid(x);
    };
    return derived;
  };
  return window.Promise = Promise = (function() {
    var FULFILLED, PENDING, REJECTED, chain, delay, _ref2;

    _ref2 = [1, 2, 3], PENDING = _ref2[0], FULFILLED = _ref2[1], REJECTED = _ref2[2];

    delay = function(fn) {
      return setTimeout(fn, 1);
    };

    chain = function(promise, fn, value) {
      return delay(function() {
        var reason, ret;

        try {
          ret = fn.apply(null, value);
          return promise.fulfil(ret);
        } catch (_error) {
          reason = _error;
          return promise.reject(reason);
        }
      });
    };

    function Promise() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.status = PENDING;
      this.value = void 0;
      this.reason = void 0;
      this.waiting = [];
      if (args.length > 0) {
        this.fulfil.apply(this, args);
      }
    }

    Promise.prototype.then = function(fulfilled, rejected) {
      var promise;

      promise = new this.constructor();
      if (typeof fulfilled !== 'function') {
        fulfilled = Function["arguments"];
      }
      if (typeof rejected !== 'function') {
        rejected = Function.identity;
      }
      switch (this.status) {
        case PENDING:
          this.waiting.push({
            promise: promise,
            fulfilled: fulfilled,
            rejected: rejected
          });
          break;
        case FULFILLED:
          chain(promise, fulfilled, this.value);
          break;
        case REJECTED:
          chain(promise, rejected, [this.reason]);
      }
      return promise;
    };

    Promise.prototype.fulfil = Function.Requiring(function() {
      return this.status === PENDING;
    })(function() {
      var fulfilled, promise, value, _i, _len, _ref3, _ref4, _results;

      value = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.value = value;
      this.status = FULFILLED;
      _ref3 = this.waiting;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], promise = _ref4.promise, fulfilled = _ref4.fulfilled;
        _results.push(chain(promise, fulfilled, this.value));
      }
      return _results;
    });

    Promise.prototype.reject = Function.Requiring(function() {
      return this.status === PENDING;
    })(function(reason) {
      var promise, rejected, _i, _len, _ref3, _ref4, _results;

      this.reason = reason;
      this.status = REJECTED;
      _ref3 = this.waiting;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], promise = _ref4.promise, rejected = _ref4.rejected;
        _results.push(chain(promise, rejected, [this.reason]));
      }
      return _results;
    });

    Promise.Fulfilled = Function.Returning(function() {
      return new Promise;
    })(function(promise) {
      return function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return promise.fulfil.apply(promise, args);
      };
    });

    Promise.Rejected = Function.Returning(function() {
      return new Promise;
    })(function(promise) {
      return function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return promise.reject.apply(promise, args);
      };
    });

    Promise.Of = function(cons) {
      var ensure, _ref3;

      ensure = Object.ensure(cons);
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref3 = _Class.__super__.constructor.apply(this, arguments);
          return _ref3;
        }

        _Class.prototype.fulfil = function() {
          var args;

          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _Class.__super__.fulfil.call(this, ensure.apply(null, args));
        };

        return _Class;

      })(this);
    };

    Promise.conjoin = function() {};

    Promise.disjoin = Function.Returning(function() {
      return new this.constructor();
    })(function(disjunction) {
      return function() {
        var promise, promises, _i, _len, _results;

        promises = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _results = [];
        for (_i = 0, _len = promises.length; _i < _len; _i++) {
          promise = promises[_i];
          _results.push(promise.then((function() {
            var args;

            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return disjunction.fulfil.apply(disjunction, args);
          }), (function() {
            var args;

            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return disjunction.fail.apply(disjunction, args);
          })));
        }
        return _results;
      };
    });

    return Promise;

  })();
});

/*
//@ sourceMappingURL=opal2.map
*/
