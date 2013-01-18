// Generated by CoffeeScript 1.4.0

define(['jquery', 'jmodel/topaz'], function($, jm) {
  var Node, View;
  Node = (function() {

    function Node(_arg) {
      this.title = _arg.title, this.href = _arg.href, this.tail = _arg.tail;
    }

    return Node;

  })();
  View = (function() {

    function View(element) {
      this.element = $(element);
    }

    View.prototype.renderNodes = function(node, preserve) {
      this.element.children('li').filter(function(index) {
        return index >= preserve;
      }).remove();
      return this.renderNode(node);
    };

    View.prototype.renderNode = function(node) {
      if (node) {
        this.element.append($('<li/>').append($('<a class="singleton"/>').attr('href', node.href).text(node.title)));
        if (node.tail) {
          return this.renderNode(node.tail);
        }
      }
    };

    return View;

  })();
  return {
    Node: Node,
    View: View
  };
});