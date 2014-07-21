// Generated by CoffeeScript 1.7.1
define(function(require) {
  var query;
  require('jmodel/sapphire2');
  query = function(selector) {
    var ancestor, ancestors, child, _i, _j, _len, _len1, _ref, _results, _results1;
    switch (false) {
      case selector.charAt(0) !== '>':
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.matches(selector.slice(2))) {
            _results.push(child);
          }
        }
        return _results;
      case selector.charAt(0) !== '<':
        ancestors = (function(parent) {
          var _results1;
          _results1 = [];
          while (parent.parentNode != null) {
            _results1.push(parent = parent.parentNode);
          }
          return _results1;
        })(this);
        _results1 = [];
        for (_j = 0, _len1 = ancestors.length; _j < _len1; _j++) {
          ancestor = ancestors[_j];
          if (typeof ancestor.matches === "function" ? ancestor.matches(selector.slice(2)) : void 0) {
            _results1.push(ancestor);
          }
        }
        return _results1;
      default:
        return this.querySelectorAll(selector);
    }
  };
  Document.prototype.find = Element.prototype.find = Function.From(String)(function(selector) {
    return new (Set.Of(Element))(query.call(this, selector));
  });
  Set.Of(Element).fromSelector = List.Of(Element).fromSelector = Function.From(String)(function(selector) {
    return document.find(selector);
  });
  Set.Of(Element).prototype.find = List.Of(Element).prototype.find = Function.From(String)(function(selector) {
    return new this.constructor(this.mapAll(function() {
      return query.call(this, selector);
    }));
  });
  Set.Of(Element).prototype.style = List.Of(Element).prototype.style = Function.From(Function)(function(fn) {
    return this.each(function() {
      return fn.call(this.style);
    });
  });
  return Set.Of(Element).prototype.data = List.Of(Element).prototype.data = Function.From(Function)(function(fn) {
    return this.each(function() {
      return fn.call(this.dataset);
    });
  });
});

//# sourceMappingURL=sapphire.dom.map