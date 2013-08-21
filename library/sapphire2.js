// Generated by CoffeeScript 1.6.3
/*
		Sapphire JavaScript Library
		http://code.google.com/p/jmodel/

		Copyright (c) 2009-2013 Richard Baker
		Dual licensed under the MIT and GPL licenses
*/

var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['jmodel/opal2'], function() {
  var List, Map, Record, Set, Stream, Tuple;
  window.Tuple = Tuple = (function() {
    function Tuple() {}

    Tuple.prototype.constuctor = function() {
      var arg, args, _i, _len, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        _results.push(Array.prototype.push.call(this, arg));
      }
      return _results;
    };

    Tuple.equal = Function.From(Tuple, Tuple)(function(_arg, _arg1) {
      var a, b;
      a = 1 <= _arg.length ? __slice.call(_arg, 0) : [];
      b = 1 <= _arg1.length ? __slice.call(_arg1, 0) : [];
      return Array.equal(a, b);
    });

    Tuple.Of = Function.From([Function])(function() {
      var constructors, types;
      constructors = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      types = constructors.map(function(constructor) {
        return Object.ensure(constructor);
      });
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          var arg, args, type, _i, _len, _ref, _ref1;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref = Array.zip(types, args);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _ref1 = _ref[_i], type = _ref1[0], arg = _ref1[1];
            Array.prototype.push.call(this, type(arg));
          }
        }

        return _Class;

      })(this);
    });

    return Tuple;

  })();
  window.Set = Set = (function() {
    function Set(elements) {
      var element, _i, _len;
      if (elements == null) {
        elements = [];
      }
      if (!(elements instanceof Array) || arguments.length > 1) {
        elements = Array.prototype.slice.call(arguments);
      }
      this.length = 0;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        this.add(element);
      }
    }

    Set.prototype.add = Function.Chaining(function(element) {
      if (!this.member(element)) {
        return Array.prototype.push.call(this, element);
      }
    });

    Set.prototype.remove = Function.From(Maybe(Function))(function(predicate) {
      var element, partition, _ref;
      if (predicate == null) {
        predicate = Boolean.True;
      }
      partition = this.partition(predicate);
      Array.prototype.splice.apply(this, [0, this.length].concat(__slice.call((function() {
          var _i, _len, _ref, _ref1, _results;
          _ref1 = (_ref = partition.get(false)) != null ? _ref : [];
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            element = _ref1[_i];
            _results.push(element);
          }
          return _results;
        })())));
      return (_ref = partition.get(true)) != null ? _ref : new this.constructor;
    });

    Set.prototype.member = Predicate.From(Maybe(Value))(function(element) {
      return -1 !== Array.prototype.indexOf.call(this, element);
    });

    Set.prototype.count = Function.From(Maybe(Function)).To(Number)(function(predicate) {
      if (predicate === void 0) {
        return this.length;
      }
      return this.reduce(Array.count(predicate), 0);
    });

    Set.prototype.where = Function.From(Function)(function(predicate) {
      var element;
      return new this.constructor((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          if (predicate.call(element, element)) {
            _results.push(element);
          }
        }
        return _results;
      }).call(this));
    });

    Set.prototype.each = Function.From(Function)(function(fn) {
      var element, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        element = this[_i];
        _results.push(fn.call(element, element));
      }
      return _results;
    });

    Set.prototype.reduce = Function.From(Function, Maybe(Value))(function(reduction, initial) {
      return Array.prototype.reduce.apply(this, [reduction].concat(__slice.call((initial != null ? [initial] : []))));
    });

    Set.prototype.partition = Function.From(Function).Returning(function() {
      return new (Map.To(Set).Using(Set.union));
    })(function(map) {
      return function(key) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(map.add(key.call(element, element), element));
        }
        return _results;
      };
    });

    Set.subset = Predicate.From(Set, Set)(function(first, second) {
      var element;
      return Array.reduce(Boolean.and)((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          _results.push(second.member(element));
        }
        return _results;
      })());
    });

    Set.equal = Predicate.From(Set, Set)(function(first, second) {
      return first.count() === second.count() && Set.subset(first, second) && Set.subset(second, first);
    });

    Set.union = Function.From([Set])(function() {
      var element, set, sets;
      sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return new this(Array.concat.apply(Array, (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = sets.length; _i < _len; _i++) {
          set = sets[_i];
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = set.length; _j < _len1; _j++) {
              element = set[_j];
              _results1.push(element);
            }
            return _results1;
          })());
        }
        return _results;
      })()));
    });

    Set.intersection = Function.From([Set])(function() {
      var element, first, rest;
      first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (first == null) {
        first = [];
      }
      return new this((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          if (rest.all(function() {
            return this.member(element);
          })) {
            _results.push(element);
          }
        }
        return _results;
      })());
    });

    Set.difference = Function.From(Set, Set)(function() {
      var element, first, rest;
      first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (first == null) {
        first = [];
      }
      return new this((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          if (rest.none(function() {
            return this.member(element);
          })) {
            _results.push(element);
          }
        }
        return _results;
      })());
    });

    Set.product = Function.From([Set]).Returning(function() {
      return new this;
    })(function(product) {
      return function() {
        var sets;
        sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      };
    });

    Set.prototype.to = Function.From(Function)(function(constructor) {
      var element;
      return new constructor((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(element);
        }
        return _results;
      }).call(this));
    });

    Set.Of = Function.From(Function)(function(constructor) {
      var _ref;
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = Function.Of(constructor)(_Class.prototype.add);

        return _Class;

      })(this);
    });

    return Set;

  })();
  window.List = List = (function() {
    function List(elements) {
      var element, _i, _len;
      if (elements == null) {
        elements = [];
      }
      if (!(elements instanceof Array)) {
        elements = [elements];
      }
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        this.add(element);
      }
    }

    List.prototype.add = Function.Chaining(function(element) {
      return Array.prototype.push.call(this, element);
    });

    List.prototype.member = function(element) {
      return -1 !== Array.prototype.indexOf.call(this, element);
    };

    List.prototype.where = Function.From(Function)(function(predicate) {
      var element;
      return new this.constructor((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          if (predicate.call(element, element)) {
            _results.push(element);
          }
        }
        return _results;
      }).call(this));
    });

    List.prototype.map = Function.From(Function)(function(fn) {
      var element;
      return new this.constructor((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(fn.call(element, element));
        }
        return _results;
      }).call(this));
    });

    List.concat = function() {
      var lists;
      lists = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return new this(Array.concat.apply(Array, lists));
    };

    List.Of = Function.From(Function)(function(constructor) {
      var _ref;
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = Function.Of(constructor)(_Class.prototype.add);

        return _Class;

      })(this);
    });

    return List;

  })();
  window.Map = Map = (function() {
    function Map(mappings) {
      this._ = {};
      if (mappings instanceof Object) {
        this.add(mappings);
      }
    }

    Map.prototype.add = Function.overload([
      Function.From(Scalar, Value)(Function.Chaining(function(key, value) {
        return this._[key] = value;
      })), Function.From(Object)(Function.Chaining(function(mappings) {
        var key, value, _results;
        _results = [];
        for (key in mappings) {
          if (!__hasProp.call(mappings, key)) continue;
          value = mappings[key];
          _results.push(this.add(key, value));
        }
        return _results;
      }))
    ]);

    Map.prototype.remove = Function.Chaining(function(key) {
      return delete this._[key];
    });

    Map.prototype.get = function(key) {
      return this._[key];
    };

    Map.prototype.keys = function() {
      var key;
      return new Set((function() {
        var _ref, _results;
        _ref = this._;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          _results.push(key);
        }
        return _results;
      }).call(this));
    };

    Map.prototype.each = function(fn) {
      var key, value, _ref, _results;
      _ref = this._;
      _results = [];
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        _results.push(fn(key, value));
      }
      return _results;
    };

    Map.prototype.ensure = Function.identity;

    Map.To = function(constructor) {
      var _ref;
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = _Class.prototype.add.extend([
          Function.From(Scalar, Value)(Function.Chaining(function(key, value) {
            return this._[key] = this.ensure(value);
          })), Function.From(Array)(Function.Chaining(function(keys) {
            var key, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = keys.length; _i < _len; _i++) {
              key = keys[_i];
              _results.push(this.add(key, this.ensure()));
            }
            return _results;
          }))
        ]);

        _Class.prototype.ensure = Object.ensure(constructor);

        _Class.value_constructor = constructor;

        return _Class;

      })(this);
    };

    Map.Using = function(combine) {
      var _ref;
      combine = combine.bind(this.value_constructor);
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = _Class.prototype.add.extend([
          Function.From(Scalar, Value)(Function.Chaining(function(key, value) {
            return this._[key] = !this._[key] ? this.ensure(value) : combine(this.ensure(value), this._[key]);
          }))
        ]);

        return _Class;

      })(this);
    };

    return Map;

  })();
  window.Stream = Stream = (function() {
    function Stream() {
      this.fns = [];
    }

    Stream.prototype.add = Function.Chaining(function() {
      var first, fn, rest, _i, _len, _ref, _results;
      first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.fns;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fn = _ref[_i];
        _results.push(fn.call.apply(fn, [first, first].concat(__slice.call(rest))));
      }
      return _results;
    });

    Stream.prototype.each = Function.From(Function)(function(fn) {
      return this.fns.push(fn);
    });

    Stream.prototype.derive = Function.From(Function).Returning(function() {
      return new this.constructor();
    })(function(child) {
      return function(fn) {
        return this.each(fn.bind(child));
      };
    });

    Stream.Of = Function.From(Function)(function(constructor) {
      var _ref;
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = Function.Of(constructor)(_Class.prototype.add);

        return _Class;

      })(this);
    });

    Stream.prototype.map = Function.From(Function).To(Stream)(function(fn) {
      return this.derive(function() {
        var first, rest;
        first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.add(fn.call.apply(fn, [first, first].concat(__slice.call(rest))));
      });
    });

    Stream.prototype.where = Function.From(Function).To(Stream)(function(predicate) {
      return this.derive(function() {
        var first, rest;
        first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (predicate.call.apply(predicate, [first, first].concat(__slice.call(rest)))) {
          return this.add.apply(this, [first].concat(__slice.call(rest)));
        }
      });
    });

    Stream.prototype.take = Function.From(Number).To(Stream)(function(number) {
      return this.where(function() {
        return number-- > 0;
      });
    });

    Stream.prototype.drop = Function.From(Number).To(Stream)(function(number) {
      return this.where(function() {
        return --number < 0;
      });
    });

    Stream.prototype.transition = Function.To(Stream)(function() {
      var _this = this;
      return (function(last) {
        return _this.where(function(x) {
          return last !== x && ((last = x) || true);
        });
      })(void 0);
    });

    Stream.prototype.control = Function.From(Stream).To(Stream)(function(control) {
      var _this = this;
      return (function(active) {
        control.each(Function.Of(Boolean)(function(state) {
          return active = state;
        }));
        return _this.where(function() {
          return active;
        });
      })(true);
    });

    Stream.prototype.between = Function.From(Stream, Stream).To(Stream)(function(start, stop) {
      return this.control(Stream.disjoin(start.map(Boolean.True), stop.map(Boolean.False)));
    });

    Stream.prototype.accumulate = Function.From(Function, Maybe(Value)).To(Stream)(function(reduction, initial) {
      var _this = this;
      if (initial == null) {
        initial = reduction.unit;
      }
      return (function(acc) {
        return _this.derive(function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return this.add(acc = reduction.call.apply(reduction, [this, acc].concat(__slice.call(args))));
        });
      })(initial);
    });

    Stream.disjoin = Function.From([Stream]).Returning(function() {
      return new Stream;
    })(function(disjunction) {
      return function() {
        var stream, streams, _i, _len, _results;
        streams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _results = [];
        for (_i = 0, _len = streams.length; _i < _len; _i++) {
          stream = streams[_i];
          _results.push(stream.each(function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return disjunction.add.apply(disjunction, args);
          }));
        }
        return _results;
      };
    });

    return Stream;

  })();
  return window.Record = Record = (function() {
    function Record() {}

    Record.Of = Function.From(Object)(function(constructors) {
      var constructor, field, record, _fn;
      record = (function(_super) {
        var field;

        __extends(_Class, _super);

        function _Class(data) {
          var field, _i, _len, _ref;
          if (data == null) {
            data = {};
          }
          this._ = {};
          _ref = this.fields;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            field = _ref[_i];
            this[field](data[field]);
          }
        }

        _Class.prototype.fields = (function() {
          var _results;
          _results = [];
          for (field in constructors) {
            if (!__hasProp.call(constructors, field)) continue;
            _results.push(field);
          }
          return _results;
        })();

        return _Class;

      })(this);
      _fn = function(field, constructor) {
        return record.prototype[field] = Function.overload([
          Function.From(Not(Function))(Function.Of(constructor).Chaining(function(value) {
            return this._[field] = value;
          })), Function.From(Function)(Function.Chaining(function(fn) {
            return this[field](fn.call(this, this._[field]));
          })), Function.From()(function() {
            return this._[field];
          })
        ]);
      };
      for (field in constructors) {
        if (!__hasProp.call(constructors, field)) continue;
        constructor = constructors[field];
        _fn(field, constructor);
      }
      return record;
    });

    return Record;

  })();
});

/*
//@ sourceMappingURL=sapphire2.map
*/
