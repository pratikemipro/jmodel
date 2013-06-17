// Generated by CoffeeScript 1.6.2
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
  var List, Map, Set, Stream;

  window.Set = Set = (function() {
    function Set(elements) {
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

    Set.prototype.add = Function.Chaining(function(element) {
      if (!this.member(element)) {
        return Array.prototype.push.call(this, element);
      }
    });

    Set.prototype.remove = Function.From(Function)(function(predicate) {
      var element, partition;

      partition = this.partition(predicate);
      Array.prototype.splice.apply(this, [0, this.length].concat((function() {
        var _i, _len, _ref, _results;

        _ref = partition.get(false);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          element = _ref[_i];
          _results.push(element);
        }
        return _results;
      })()));
      return partition.get(true);
    });

    Set.prototype.replace = Function.Chaining(function(before, after) {
      var index;

      index = Array.prototype.indexOf.call(this, before);
      if (index !== -1) {
        return this[index] = after;
      }
    });

    Set.prototype.member = function(element) {
      return -1 !== Array.prototype.indexOf.call(this, element);
    };

    Set.prototype.count = function(predicate) {
      var reduction;

      if (predicate === void 0) {
        return this.length;
      }
      reduction = function(sum, element) {
        return sum += predicate(element) ? 1 : 0;
      };
      return this.reduce(reduction, 0);
    };

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

    Set.prototype.each = function(fn) {
      var element, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        element = this[_i];
        _results.push(fn(element));
      }
      return _results;
    };

    Set.prototype.map = Function.From(Function).Returning(function() {
      return new Set;
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

    Set.prototype.select = Function.From(Function).Returning(function() {
      return new List;
    })(function(list) {
      return function(fn) {
        var element, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          element = this[_i];
          _results.push(list.add(fn(element)));
        }
        return _results;
      };
    });

    Set.prototype.reduce = function(reduction, initial) {
      return Array.prototype.reduce.call(this, reduction, initial);
    };

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

    Set.equal = Function.From(Set, Set).To(Boolean)(function(first, second) {
      var element;

      return [true].concat((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          element = first[_i];
          _results.push(second.member(element));
        }
        return _results;
      })()).concat((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = second.length; _i < _len; _i++) {
          element = second[_i];
          _results.push(first.member(element));
        }
        return _results;
      })()).reduce(function(a, b) {
        return a && b;
      });
    });

    Set.union = Function.From([Set]).Returning(function() {
      return new Set;
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
      return new Set;
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
      return new Set;
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
      return new Set;
    })(function(product) {
      return function() {
        var sets;

        sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      };
    });

    Set.Of = function(cons) {
      var _ref;

      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = function(element) {
          return _Class.__super__.add.call(this, this.ensure(element));
        };

        _Class.prototype.ensure = Object.ensure(cons);

        return _Class;

      })(this);
    };

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

    List.Of = function(cons) {
      var _ref;

      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = function(element) {
          return _Class.__super__.add.call(this, this.ensure(element));
        };

        _Class.prototype.ensure = Object.ensure(cons);

        return _Class;

      })(this);
    };

    return List;

  })();
  window.Map = Map = (function() {
    function Map(mappings) {
      var key, value;

      if (mappings == null) {
        mappings = {};
      }
      for (key in mappings) {
        if (!__hasProp.call(mappings, key)) continue;
        value = mappings[key];
        this.add(key, value);
      }
    }

    Map.prototype.add = function(key, value) {
      var _results;

      switch (arguments.length) {
        case 2:
          return this[key] = value;
        default:
          _results = [];
          for (key in key) {
            if (!__hasProp.call(key, key)) continue;
            value = key[key];
            _results.push(this.add(key, value));
          }
          return _results;
      }
    };

    Map.prototype.remove = function(key) {
      return this[key] = void 0;
    };

    Map.prototype.get = function(key) {
      return this[key];
    };

    Map.prototype.each = function(fn) {
      var key, value, _results;

      _results = [];
      for (key in this) {
        if (!__hasProp.call(this, key)) continue;
        value = this[key];
        _results.push(fn(key, value));
      }
      return _results;
    };

    Map.prototype.ensure = function(x) {
      return x;
    };

    Map.To = function(cons) {
      var _ref;

      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = function(key, value) {
          return _Class.__super__.add.call(this, key, this.ensure(value));
        };

        _Class.prototype.ensure = Object.ensure(cons);

        return _Class;

      })(this);
    };

    Map.Using = function(combine) {
      var _ref;

      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = function(key, value) {
          return _Class.__super__.add.call(this, key, !this[key] ? this.ensure(value) : combine(this.ensure(value), this.ensure(this[key])));
        };

        return _Class;

      })(this);
    };

    return Map;

  })();
  return window.Stream = Stream = (function() {
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

    Stream.Of = Function.From(Function)(function(cons) {
      var ensure, _ref;

      ensure = Object.ensure(cons);
      return (function(_super) {
        __extends(_Class, _super);

        function _Class() {
          _ref = _Class.__super__.constructor.apply(this, arguments);
          return _ref;
        }

        _Class.prototype.add = function() {
          var args;

          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _Class.__super__.add.call(this, ensure.apply(null, args));
        };

        return _Class;

      })(this);
    });

    return Stream;

  })();
});

/*
//@ sourceMappingURL=sapphire2.map
*/
