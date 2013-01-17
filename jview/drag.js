// Generated by CoffeeScript 1.4.0
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['jquery', 'jmodel/emerald', 'jmodel-plugins/jquery.emerald'], function($, jm) {
  var Source, Target;
  Source = (function() {

    function Source(element, extractors) {
      var _this = this;
      this.element = $(element);
      this.extractors = new jm.List.fromArray(extractors);
      this.element.attr('draggable', true).event('dragstart').subscribe(function(_arg) {
        var dataTransfer, srcElement, _ref;
        (_ref = _arg.originalEvent, dataTransfer = _ref.dataTransfer), srcElement = _arg.srcElement;
        dataTransfer.dropEffect = 'none';
        return _this.extractors.each(function(extractor) {
          var data, type, _ref1;
          _ref1 = extractor($(srcElement)), type = _ref1[0], data = _ref1[1];
          return dataTransfer.setData(type, (/json/.test(type) ? JSON.stringify(data) : data));
        });
      });
    }

    return Source;

  })();
  Target = (function() {

    function Target(_arg) {
      var element, types,
        _this = this;
      element = _arg.element, types = _arg.types, this.effect = _arg.effect;
      this.accept = __bind(this.accept, this);

      this.element = $(element);
      this.types = new jm.List.fromArray(types);
      this.events = new jm.EventRegistry('drop');
      jm.disjoin(this.element.event('dragenter', {
        preventDefault: true
      }).where(this.accept).map(function() {
        return 1;
      }), this.element.event('dragleave', {
        preventDefault: true
      }).where(this.accept).map(function() {
        return -1;
      }), this.element.event('drop', {
        preventDefault: true
      }).map(function() {
        return -1;
      })).accumulate(jm.plus, 0).subscribe(function(count) {
        return _this.element.toggleClass('over', count > 0);
      });
      this.element.event('dragover', {
        preventDefault: true
      }).where(this.accept).subscribe(function(_arg1) {
        var dataTransfer;
        dataTransfer = _arg1.originalEvent.dataTransfer;
        dataTransfer.dropEffect = this.effect;
        return false;
      });
      this.element.event('drop', {
        stopPropagation: true
      }).where(this.accept).subscribe(function(_arg1) {
        var data, dataTransfer;
        dataTransfer = _arg1.originalEvent.dataTransfer;
        _this.element.removeClass('over');
        data = new jm.Map();
        _this.types.each(function(type) {
          var datum;
          datum = dataTransfer.getData(type);
          return _this.event('drop').raise((/json/.test(type) ? JSON.parse(datum) : datum), type);
        });
        return false;
      });
    }

    Target.prototype.event = function(name) {
      return this.events.get(name);
    };

    Target.prototype.accept = function(_arg) {
      var type;
      type = _arg.originalEvent.dataTransfer.types[0];
      return this.types.first(Object.eq(type));
    };

    return Target;

  })();
  return {
    Source: Source,
    Target: Target
  };
});
