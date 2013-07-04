// Generated by CoffeeScript 1.6.3
/*
		Topaz JavaScript Library
		http://code.google.com/p/jmodel/

		Copyright (c) 2009-2013 Richard Baker
		Dual licensed under the MIT and GPL licenses
*/

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

define(['jmodel/emerald2'], function() {
  var Observable;
  return window.Observable = Observable = function(constructor) {
    switch (false) {
      case !(constructor === Set || constructor.inherits(Set)):
        return (function(_super) {
          __extends(_Class, _super);

          function _Class() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            this.events = new EventRegistry(['add', 'remove', 'change']);
            this.event = Function.delegate(function() {
              return [this.events, this.events.get];
            });
            _Class.__super__.constructor.apply(this, arguments);
          }

          _Class.prototype.add = function() {
            var length;
            length = this.length;
            _Class.__super__.add.apply(this, arguments);
            if (length !== this.length) {
              this.event('add').raise(this[length]);
            }
            return this;
          };

          _Class.prototype.remove = _Class.prototype.remove.post(function(removed) {
            var item, _i, _results;
            _results = [];
            for (_i = removed.length - 1; _i >= 0; _i += -1) {
              item = removed[_i];
              _results.push(this.event('remove').raise(item));
            }
            return _results;
          });

          return _Class;

        })(constructor);
      case !(constructor === List || constructor.inherits(List)):
        return (function(_super) {
          __extends(_Class, _super);

          function _Class() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            this.events = new EventRegistry(['add', 'change']);
            this.event = Function.delegate(function() {
              return [this.events, this.events.get];
            });
            _Class.__super__.constructor.apply(this, arguments);
          }

          _Class.prototype.add = _Class.prototype.add.post(function(list, item) {
            return this.event('add').raise(item);
          });

          return _Class;

        })(constructor);
      case !(constructor === Map || constructor.inherits(Map)):
        return (function(_super) {
          __extends(_Class, _super);

          function _Class() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            this.events = new EventRegistry(['add', 'remove', 'change']);
            this.event = Function.delegate(function() {
              return [this.events, this.events.get];
            });
            _Class.__super__.constructor.apply(this, arguments);
          }

          _Class.prototype.add = _Class.prototype.add.extend([
            Function.From(Scalar, Value)(Function.Chaining(function(key, value) {
              value = this.ensure(value);
              this._[key] = value;
              return this.event('add').raise(key, value);
            }))
          ]);

          _Class.prototype.remove = Function.Chaining(function(key) {
            if (this._[key] != null) {
              delete this._[key];
              return this.event('remove').raise(key);
            }
          });

          return _Class;

        })(constructor);
    }
  };
});

/*
//@ sourceMappingURL=topaz2.map
*/
