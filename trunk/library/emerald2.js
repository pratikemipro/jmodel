// Generated by CoffeeScript 1.6.2
/*
		Emerald JavaScript Library
		http://code.google.com/p/jmodel/

		Copyright (c) 2009-2013 Richard Baker
		Dual licensed under the MIT and GPL licenses
*/

var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['jmodel/sapphire2'], function() {
  var Character, EventRegistry, EventType, SpecialKey, Subscriber, codes, _class, _ref;

  codes = {
    ':backspace': 8,
    ':tab': 9,
    ':return': 13,
    ':shift': 16,
    ':ctrl': 17,
    ':alt': 18,
    ':escape': 27,
    ':left': 37,
    ':up': 38,
    ':right': 39,
    ':down': 40,
    ':delete': 46,
    ':leftcmd': 91,
    ':rightcmd': 93
  };
  Character = String.Where(function(str) {
    return str.length === 1;
  });
  SpecialKey = String.Matching(/:.+/);
  Event.key = Function["switch"]([
    Type(Character)(function(key) {
      return function(_arg) {
        var which;

        which = _arg.which;
        return String.fromCharCode(which).toUpperCase() === key;
      };
    }), Type(RegExp)(function(regex) {
      return function(_arg) {
        var which;

        which = _arg.which;
        return String.fromCharCode(which).toUpperCase().match(regex) || false;
      };
    }), Type(Number)(function(number) {
      return function(_arg) {
        var which;

        which = _arg.which;
        return which === number;
      };
    }), Type(SpecialKey)(function(identifier) {
      return Event.key(codes[identifier]);
    }), Type(Value, [Value])(function() {
      var identifer, identifiers;

      identifer = arguments[0], identifiers = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return Event.key(identifier).or(Event.key.apply(Event, identifiers));
    })
  ]);
  window.Subscriber = Subscriber = (function() {
    function Subscriber() {
      _ref = _class.apply(this, arguments);
      return _ref;
    }

    _class = Function.From(Maybe(Function, Maybe(Function)))(function(notify, fail) {
      this.notify = notify;
      this.fail = fail;
    });

    return Subscriber;

  })();
  window.EventType = EventType = (function(_super) {
    __extends(EventType, _super);

    function EventType() {
      var _this = this;

      EventType.__super__.constructor.call(this);
      this.subscribers = new (Set.Of(Subscriber));
      this.each(function(promise) {
        return _this.subscribers.each(function(_arg) {
          var fail, notify;

          notify = _arg.notify, fail = _arg.fail;
          return promise.then(notify, fail);
        });
      });
    }

    EventType.prototype.subscribe = Function.delegate(function() {
      return [this.subscribers, this.subscribers.add];
    });

    EventType.prototype.raise = function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.add(Promise.Fulfilled.apply(Promise, args));
    };

    EventType.prototype.fail = function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.add(Promise.Rejected.apply(Promise, args));
    };

    return EventType;

  })(Stream.Of(Promise));
  return window.EventRegistry = EventRegistry = (function(_super) {
    __extends(EventRegistry, _super);

    function EventRegistry(eventtypes) {
      var eventtype, _i, _len;

      if (eventtypes == null) {
        eventtypes = [];
      }
      for (_i = 0, _len = eventtypes.length; _i < _len; _i++) {
        eventtype = eventtypes[_i];
        this.add(eventtype);
      }
    }

    EventRegistry.prototype.register = function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.add.apply(this, args);
    };

    EventRegistry.prototype.create = Function.Returning(function() {
      return new EventType;
    })(function(eventtype) {
      return function(key) {
        return this.add(key, eventtype);
      };
    });

    EventRegistry.prototype.subscribe = Function.From(Object)(function(subscriptions) {
      var name, subscriber, _results;

      _results = [];
      for (name in subscriptions) {
        if (!__hasProp.call(subscriptions, name)) continue;
        subscriber = subscriptions[name];
        _results.push(this.get(name).subscribe(subscriber));
      }
      return _results;
    });

    EventRegistry.prototype.republish = function() {};

    return EventRegistry;

  })(Map.To(EventType));
});

/*
//@ sourceMappingURL=emerald2.map
*/
