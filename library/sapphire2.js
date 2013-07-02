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
  var List, Map, Record, Set, Stream;
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
      Array.prototype.splice.apply(this, [0, this.length].concat((function() {
        var _i, _len, _ref, _ref1, _results;
        _ref1 = (_ref = partition.get(false)) != null ? _ref : [];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          element = _ref1[_i];
          _results.push(element);
        }
        return _results;
      })()));
      return (_ref = partition.get(true)) != null ? _ref : new this.constructor;
    });

    Set.prototype.member = Predicate.From(Maybe(Value))(function(element) {
      return -1 !== Array.prototype.indexOf.call(this, element);
    });

    Set.prototype.count = Function.From(Maybe(Function)).To(Number)(function(predicate) {
      var reduction;
      if (predicate === void 0) {
        return this.length;
      }
      reduction = function(sum, element) {
        return sum += predicate(element) ? 1 : 0;
      };
      return this.reduce(reduction, 0);
    });

    Set.prototype.where = Function.From(Function).Returning(function() {
      return new Set;
    })(function(set) {
      return function(predicate) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          if (predicate(element)) {
            _results.push(set.add(element));
          }
        }
        return _results;
      };
    });

    Set.prototype.each = Function.From(Function)(function(fn) {
      var element, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        element = this[_i];
        _results.push(fn(element));
      }
      return _results;
    });

    Set.prototype.reduce = Function.From(Function, Maybe(Value))(function(reduction, initial) {
      return Array.prototype.reduce.apply(this, [reduction].concat(initial != null ? [initial] : []));
    });

    Set.prototype.partition = Function.From(Function).Returning(function() {
      return new (Map.To(Set).Using(Set.union));
    })(function(map) {
      return function(key) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(map.add(key(element), element));
        }
        return _results;
      };
    });

    Set.subset = Predicate.From(Set, Set)(function(first, second) {
      var element;
      return [true].concat((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          _results.push(second.member(element));
        }
        return _results;
      })()).reduce(function(a, b) {
        return a && b;
      });
    });

    Set.equal = Predicate.From(Set, Set)(function(first, second) {
      return first.count() === second.count() && Set.subset(first, second) && Set.subset(second, first);
    });

    Set.union = Function.From([Set]).Returning(function() {
      return new this;
    })(function(union) {
      return function() {
        var element, set, sets, _i, _len, _results;
        sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _results = [];
        for (_i = 0, _len = sets.length; _i < _len; _i++) {
          set = sets[_i];
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = set.length; _j < _len1; _j++) {
              element = set[_j];
              _results1.push(union.add(element));
            }
            return _results1;
          })());
        }
        return _results;
      };
    });

    Set.intersection = Function.From([Set]).Returning(function() {
      return new this;
    })(function(intersection) {
      return function() {
        var element, first, rest, set, _i, _len, _results;
        first = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (first == null) {
          first = [];
        }
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          if ([true].concat((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = rest.length; _j < _len1; _j++) {
              set = rest[_j];
              _results1.push(set.member(element));
            }
            return _results1;
          })()).reduce(function(a, b) {
            return a && b;
          })) {
            _results.push(intersection.add(element));
          }
        }
        return _results;
      };
    });

    Set.difference = Function.From(Set, Set).Returning(function() {
      return new this;
    })(function(difference) {
      return function(first, second) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          if (!second.member(element)) {
            _results.push(difference.add(element));
          }
        }
        return _results;
      };
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

    List.prototype.where = Function.From(Function).Returning(function() {
      return new List;
    })(function(list) {
      return function(predicate) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          if (predicate(element)) {
            _results.push(List.add(element));
          }
        }
        return _results;
      };
    });

    List.prototype.map = Function.From(Function).Returning(function() {
      return new List;
    })(function(mapped) {
      return function(fn) {
        var element, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(mapped.add(fn(element)));
        }
        return _results;
      };
    });

    List.concat = function() {
      var base, other, others;
      base = arguments[0], others = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return new base.constructor(Array.prototype.concat.apply(Array.prototype.slice.call(base), (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = others.length; _i < _len; _i++) {
          other = others[_i];
          _results.push(Array.prototype.slice.call(other));
        }
        return _results;
      })()));
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

    Map.prototype.add = Function["switch"]([
      Type(Value, Value)(Function.Chaining(function(key, value) {
        return this._[key] = value;
      })), Type(Object)(Function.Chaining(function(mappings) {
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
          Type(Value, Value)(Function.Chaining(function(key, value) {
            return this._[key] = this.ensure(value);
          })), Type(Array)(Function.Chaining(function(keys) {
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
          Type(Value, Value)(Function.Chaining(function(key, value) {
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
      var args, fn, _i, _len, _ref, _results;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.fns;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fn = _ref[_i];
        _results.push(fn.apply(null, args));
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
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.add(fn.apply(null, args));
      });
    });

    Stream.prototype.where = Function.From(Function).To(Stream)(function(predicate) {
      return this.derive(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (predicate.apply(null, args)) {
          return this.add.apply(this, args);
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
          return this.add(acc = reduction.apply(this, [acc].concat(args)));
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
      var field, record, _fn;
      record = (function(_super) {
        var constructor, field;

        __extends(_Class, _super);

        function _Class(data) {
          var ensure, field, _ref;
          if (data == null) {
            data = {};
          }
          this._ = {};
          _ref = this.ensure;
          for (field in _ref) {
            if (!__hasProp.call(_ref, field)) continue;
            ensure = _ref[field];
            this._[field] = ensure(data[field]);
          }
        }

        _Class.prototype.ensure = Object.union((function() {
          var _results;
          _results = [];
          for (field in constructors) {
            if (!__hasProp.call(constructors, field)) continue;
            constructor = constructors[field];
            _results.push(Object.from(field, Object.ensure(constructor)));
          }
          return _results;
        })());

        return _Class;

      })(this);
      _fn = function(field) {
        return record.prototype[field] = Function["switch"]([
          Type(Function)(Function.Chaining(function(fn) {
            return this[field](fn.call(this, this._[field]));
          })), Type(Value)(Function.Chaining(function(value) {
            return this._[field] = value;
          })), Type()(function() {
            return this._[field];
          })
        ]);
      };
      for (field in constructors) {
        if (!__hasProp.call(constructors, field)) continue;
        _fn(field);
      }
      return record;
    });

    return Record;

  })();
});

/*
//@ sourceMappingURL=sapphire2.map
*/
