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

    Set.prototype.add = function(element) {
      if (this.member(element)) {
        return this;
      } else {
        return Array.prototype.push.call(this, element);
      }
    };

    Set.prototype.remove = function(predicate) {
      var x;

      return Array.prototype.splice.call(this, 0, this.length, (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          x = this[_i];
          if (!predicate(x)) {
            _results.push(x);
          }
        }
        return _results;
      }).call(this));
    };

    Set.prototype.member = function(element) {
      return -1 !== Array.prototype.indexOf.call(this, element);
    };

    Set.prototype.each = function(fn) {
      var element, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        element = this[_i];
        _results.push(fn(element));
      }
      return _results;
    };

    Set.union = function() {
      var set, sets, x;

      sets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return new this.constructor((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = sets.length; _i < _len; _i++) {
          set = sets[_i];
          _results.push((function() {
            var _j, _len1, _results1;

            _results1 = [];
            for (_j = 0, _len1 = set.length; _j < _len1; _j++) {
              x = set[_j];
              _results1.push(x);
            }
            return _results1;
          })());
        }
        return _results;
      })());
    };

    Set.intersection = function() {};

    Set.difference = function() {};

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

    List.prototype.add = function(element) {
      Array.prototype.push.call(this, element);
      return this;
    };

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
