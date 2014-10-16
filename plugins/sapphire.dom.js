// Generated by CoffeeScript 1.8.0
var __hasProp = {}.hasOwnProperty;

define(function(require) {
  var context, ensureElement, getAttributes, query;
  require('jmodel/sapphire2');
  Element.create = Function.From(String)(function(html) {
    var element;
    element = Object.execute(function() {
      return this.innerHTML = html;
    })(document.createElement('div')).childNodes[0];
    return element;
  });
  ensureElement = function(element) {
    if (element instanceof Element) {
      return element;
    } else {
      return Element.create(element);
    }
  };
  Set.Of(Element).prototype.add = function(element) {
    return Set.prototype.add.call(this, ensureElement(element));
  };
  List.Of(Element).prototype.add = function(element) {
    return List.prototype.add.call(this, ensureElement(element));
  };
  query = function(selector) {
    var ancestor, ancestors, child, parent, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _results, _results1, _results2;
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
      case selector.substring(0, 2) !== '<<':
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
          if (typeof ancestor.matches === "function" ? ancestor.matches(selector.slice(3)) : void 0) {
            _results1.push(ancestor);
          }
        }
        return _results1;
      case selector.charAt(0) !== '<':
        _ref1 = [this.parentNode];
        _results2 = [];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          parent = _ref1[_k];
          if (parent.matches(selector.slice(2))) {
            _results2.push(parent);
          }
        }
        return _results2;
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
  context = function(property) {
    return Function.overload([
      Function.From()(function() {
        return this.to(List).map(function() {
          return this[property];
        });
      }), Function.From(String)(function(name) {
        return this.to(List).map(function() {
          return this[property][name];
        });
      }), Function.From(Function)(function(fn) {
        return this.each(function() {
          return Object.execute(fn)(this[property]);
        });
      })
    ]);
  };
  Set.Of(Element).prototype.style = List.Of(Element).prototype.style = context('style').extend([
    Function.From()(function() {
      return this.to(List).map(function() {
        return window.getComputedStyle(this);
      });
    }), Function.From(String)(function(name) {
      return this.style().map(function() {
        return this[name];
      });
    })
  ]);
  Set.Of(Element).prototype.dataset = List.Of(Element).prototype.dataset = context('dataset');
  Set.Of(Element).prototype.classes = List.Of(Element).prototype.classes = context('classList').extend([
    Function.From(String)(function(name) {
      return this.classes().map(function() {
        return this.contains(name);
      });
    })
  ]);
  getAttributes = Function.Returning(function() {
    return {};
  })(function(attributes) {
    return function() {
      var attr, _i, _len, _ref, _results;
      _ref = this.attributes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _results.push(attributes[attr.name] = attr.value);
      }
      return _results;
    };
  });
  return Set.Of(Element).prototype.attributes = List.Of(Element).prototype.attributes = Function.overload([
    Function.From()(function() {
      return this.to(List).map(getAttributes);
    }), Function.From(String)(function(name) {
      return this.attributes().map(function() {
        return this[name];
      });
    }), Function.From(Function)(function(fn) {
      return this.each(function() {
        var name, value, _ref, _results;
        _ref = Object.execute(fn)(getAttributes.call(this));
        _results = [];
        for (name in _ref) {
          if (!__hasProp.call(_ref, name)) continue;
          value = _ref[name];
          if ((value != null) && value) {
            _results.push(this.setAttribute(name, value));
          } else {
            _results.push(this.removeAttribute(name));
          }
        }
        return _results;
      });
    })
  ]);
});

//# sourceMappingURL=sapphire.dom.js.map
