// Generated by CoffeeScript 1.7.1
var __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require) {
  var $, AjaxEventType;
  $ = require('jquery');
  require('jmodel/emerald2');
  EventType.fromAjax = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(AjaxEventType, args, function(){});
  };
  return window.AjaxEventType = AjaxEventType = (function(_super) {
    __extends(AjaxEventType, _super);

    function AjaxEventType(descriptor, settings) {
      var _base, _ref;
      this.descriptor = descriptor != null ? descriptor : {};
      AjaxEventType.__super__.constructor.call(this);
      if (typeof settings === 'object') {
        this.descriptor.settings = settings;
      }
      this.descriptor.success = (function(_this) {
        return function() {
          var args, _ref;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return (_ref = _this.raise).call.apply(_ref, [_this].concat(__slice.call(args), __slice.call(_this.descriptor)));
        };
      })(this);
      this.descriptor.error = (function(_this) {
        return function() {
          var args, _ref;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return (_ref = _this.fail).call.apply(_ref, [_this].concat(__slice.call(args), __slice.call(_this.descriptor)));
        };
      })(this);
      this.descriptor.beforeSend = function(xhr, settings) {
        var _ref, _ref1;
        if ((_ref = $.ajaxSettings) != null) {
          if (typeof _ref.beforeSend === "function") {
            _ref.beforeSend(xhr, settings);
          }
        }
        if ((_ref1 = settings.type) !== 'GET' && _ref1 !== 'POST') {
          xhr.setRequestHeader('X-HTTP-METHOD', settings.type);
          return settings.type = 'POST';
        }
      };
      if ((_base = this.descriptor).immediate == null) {
        _base.immediate = true;
      }
      this.remember = (_ref = this.descriptor.remember) != null ? _ref : 1;
      if (this.descriptor.immediate) {
        this.start();
      }
    }

    AjaxEventType.prototype.start = Function.Chaining(function(data) {
      var _ref;
      if (data == null) {
        data = {};
      }
      if (this.descriptor.singleton) {
        this.stop();
      }
      this.descriptor.data = Object.extend((_ref = this.descriptor.data) != null ? _ref : {}, data);
      return this.__ajax = $.ajax.call(null, this.descriptor);
    });

    AjaxEventType.prototype.stop = Function.Chaining(function() {
      return typeof this.__ajax === "function" ? this.__ajax(typeof abort === "function" ? abort() : void 0) : void 0;
    });

    return AjaxEventType;

  })(EventType);
});

//# sourceMappingURL=emerald.jquery.map
