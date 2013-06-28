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
            var args, events;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            events = new EventRegistry(['add', 'remove', 'replace', 'change']);
            this.event = Function.delegate(function() {
              return [events, events.get];
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
    }
  };
});

/*
//@ sourceMappingURL=topaz2.map
*/