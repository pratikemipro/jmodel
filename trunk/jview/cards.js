// Generated by CoffeeScript 1.7.1
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

define(function(require) {
  var $, AjaxCard, Application, Card, Controller, List, ListView, Route, Router, ViewPort, after, jm;
  $ = require('jquery');
  jm = require('jmodel/topaz');
  require('jmodel-plugins/jquery.emerald');
  require('jmodel-plugins/emerald.keys');
  after = function(period) {
    return function(fn) {
      return jm.event.after(period).subscribe(fn);
    };
  };
  $.target = function(fn) {
    return function(_arg) {
      var target;
      target = _arg.target;
      return fn.call($(target));
    };
  };
  Card = (function() {
    function Card() {
      this.events = new jm.EventRegistry('ready', 'dispose', 'current');
      this.event('ready').remember(1);
      this.li = this.li ? $(this.li) : $('<li class="card"/>');
      this.li.addClass(this["class"]);
      this.li.event('click', '.close').subscribe((function(_this) {
        return function() {
          _this.event('dispose').raise(_this);
          return false;
        };
      })(this));
    }

    Card.prototype.event = function(name) {
      return this.events.get(name);
    };

    return Card;

  })();
  AjaxCard = (function(_super) {
    __extends(AjaxCard, _super);

    AjaxCard.prototype["class"] = '';

    AjaxCard.prototype.load = null;

    function AjaxCard() {
      AjaxCard.__super__.constructor.call(this);
      this.events.add('load', jm.event.fromAjax(this.load));
      this.event('load').subscribe((function(_this) {
        return function(html) {
          return _this.init(html);
        };
      })(this));
    }

    AjaxCard.prototype.get = function(params) {
      return this.event('load').start(params);
    };

    AjaxCard.prototype.init = function(html) {
      this.li.html(html);
      this.li.toggleClass('error', $(html).hasClass('error'));
      this.url = this.li.children('article').data('url');
      return this.event('ready').raise(this);
    };

    return AjaxCard;

  })(Card);
  List = (function() {
    function List(external, application) {
      this.external = external;
      this.application = application;
      this.cards = new jm.ObservableTypedList(Card);
      this.events = new jm.EventRegistry('add', 'insert', 'replace', 'remove', 'count', 'ready');
      this.event('ready').remember(1);
      this.cards.events.republish({
        add: this.event('add'),
        insert: this.event('insert'),
        replace: this.event('replace'),
        remove: this.event('remove')
      });
      jm.disjoin(this.cards.event('add'), this.cards.event('insert'), this.cards.event('replace').map(function(_, card) {
        return card;
      })).subscribe((function(_this) {
        return function(card) {
          card.event('ready').subscribe(function(card) {
            return _this.event('ready').raise(card);
          });
          return card.event('dispose').subscribe(function(card) {
            return _this.cards.remove(card);
          });
        };
      })(this));
    }

    List.prototype.event = function(name) {
      return this.events.get(name);
    };

    List.prototype.add = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).add.apply(_ref, args);
    };

    List.prototype.insert = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).insert.apply(_ref, args);
    };

    List.prototype.replace = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).replace.apply(_ref, args);
    };

    List.prototype.remove = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).remove.apply(_ref, args);
    };

    List.prototype.get = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).get.apply(_ref, args);
    };

    List.prototype.count = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).count.apply(_ref, args);
    };

    List.prototype.first = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).first.apply(_ref, args);
    };

    List.prototype.each = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.cards).each.apply(_ref, args);
    };

    return List;

  })();
  ListView = (function() {
    function ListView(cards, element, duration) {
      this.cards = cards;
      this.duration = duration != null ? duration : 750;
      this.element = $(element);
      this.events = new jm.EventRegistry('ready', 'removed');
      this.cards.events.subscribe({
        add: (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return _this.add.apply(_this, args);
          };
        })(this),
        insert: (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return _this.insert.apply(_this, args);
          };
        })(this),
        replace: (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return _this.replace.apply(_this, args);
          };
        })(this),
        remove: (function(_this) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return _this.remove.apply(_this, args);
          };
        })(this)
      });
    }

    ListView.prototype.event = function(name) {
      return this.events.get(name);
    };

    ListView.prototype.fold = function() {
      return this.element.find('li.card').each(function(index, li) {
        return $(li).css({
          '-webkit-transform': 'rotate(' + (4 * (index % 2) - 2) + 'deg)',
          'left': (-1 * $(li).offset().left + 100 * index) + 'px'
        });
      });
    };

    ListView.prototype.add = function(card) {
      this.element.find('li.card').removeClass('zoomed');
      this.element.append('<li class="extent"><ul><li class="label hidden"></li></ul></li>');
      return card.event('ready').take(1).subscribe((function(_this) {
        return function() {
          card.li.children().addClass('adding');
          return after(350)(function() {
            _this.element.children('li.extent:last').children('ul').append(card.li);
            return after(1)(function() {
              card.li.children().removeClass('adding');
              _this.event('ready').raise(card);
              return after(350)(function() {
                return _this.element.find('li.extent > ul > li.label').removeClass('hidden');
              });
            });
          });
        };
      })(this));
    };

    ListView.prototype.insert = function(card, index) {
      var cards, li;
      cards = this.element.find('li.card');
      cards.removeClass('zoomed');
      this.element.find('li.extent > ul > li.label').removeClass('hidden');
      li = card.li;
      li.addClass('adding');
      if (index === 0) {
        this.element.find('li.card').eq(0).before(li);
      } else {
        this.element.find('li.card').eq(index - 1).after(li);
      }
      return card.event('ready').take(1).subscribe((function(_this) {
        return function() {
          return after(350)(function() {
            var width;
            width = Math.min(window.innerWidth, li.children('article').outerWidth(true));
            li.css('width', width);
            return after(_this.duration)(function() {
              li.removeClass('adding');
              return _this.event('ready').raise(card);
            });
          });
        };
      })(this));
    };

    ListView.prototype.replace = function(before, card) {
      return card.event('ready').take(1).subscribe((function(_this) {
        return function() {
          before.li.removeClass('zoomed').after(card.li);
          card.li.removeClass('zoomed');
          return after(_this.duration)(function() {
            return $('body').animate({
              scrollLeft: $('body').width()
            }, 1000, function() {
              before.li.remove();
              card.li.addClass('zoomed');
              return after(350)(function() {
                return _this.event('ready').raise(card);
              });
            });
          });
        };
      })(this));
    };

    ListView.prototype.remove = function(card) {
      var li;
      li = card.li;
      li.children().addClass('removing');
      return after(this.duration)((function(_this) {
        return function() {
          li.addClass('removing');
          return after(_this.duration)(function() {
            var extent;
            extent = li.closest('li.extent');
            li.remove().removeClass('removing');
            li.children().removeClass('removing');
            _this.event('removed').raise(card);
            if (extent.find('li.card').length === 0) {
              extent.remove();
            }
            if (_this.cards.count() === 1) {
              return after(350)(function() {
                _this.element.find('li.card').addClass('zoomed');
                return _this.element.find('li.extent > ul > li.label').addClass('hidden');
              });
            }
          });
        };
      })(this));
    };

    return ListView;

  })();
  ViewPort = (function() {
    ViewPort.offsets = [];

    ViewPort.width = 0;

    ViewPort.scrollLeft = 0;

    function ViewPort(cardListView, element, controls, offset) {
      var keyEvent;
      this.cardListView = cardListView;
      this.offset = offset != null ? offset : 64;
      this.element = $(element);
      this.controls = $(controls);
      this.state = new jm.ObservableObject({
        index: {
          type: Number,
          defaultValue: 0,
          remember: 1,
          repeat: true
        }
      });
      this.state.event('index').subscribe((function(_this) {
        return function(index) {
          return _this.scrollTo(index);
        };
      })(this));
      this.state.event('index').subscribe((function(_this) {
        return function(index) {
          var _base, _ref;
          return typeof (_base = _this.cardListView.cards.get(index)).event === "function" ? (_ref = _base.event('current')) != null ? _ref.raise() : void 0 : void 0;
        };
      })(this));
      jm.conjoin(this.cardListView.element.event('mousedown', 'li.card'), this.cardListView.element.event('mouseup', 'li.card')).map(function(down, up) {
        return {
          target: $(down.target),
          deltaX: up.screenX - down.screenX,
          deltaY: up.screenY - down.screenY
        };
      }).where(Function.and(function(_arg) {
        var target;
        target = _arg.target;
        return target.closest('a').length === 0;
      }, function(_arg) {
        var deltaX;
        deltaX = _arg.deltaX;
        return (-3 < deltaX && deltaX < 3);
      }, function(_arg) {
        var deltaY;
        deltaY = _arg.deltaY;
        return (-3 < deltaY && deltaY < 3);
      })).subscribe((function(_this) {
        return function(_arg) {
          var target, targetIndex;
          target = _arg.target;
          targetIndex = target.closest('li.card').index('li.card');
          if (targetIndex !== _this.state.index()) {
            return _this.state.index(target.closest('li.card').index('li.card'));
          }
        };
      })(this));
      keyEvent = this.element.event('keydown').where(function(_arg) {
        var target;
        target = _arg.target;
        return $(target).closest('input,select,textarea,[contentEditable=true]').length === 0;
      });
      jm.disjoin(keyEvent.where(jm.key(':left')).map(function() {
        return -1;
      }), keyEvent.where(jm.key(':right')).map(function() {
        return 1;
      })).subscribe((function(_this) {
        return function(step) {
          _this.state.index(Math.max(0, Math.min(_this.cardListView.cards.count() - 1, _this.state.index() + step)));
          return false;
        };
      })(this));
      jm.disjoin(this.cardListView.event('ready'), this.cardListView.event('removed')).subscribe((function(_this) {
        return function() {
          return _this.controls.toggleClass('hidden', _this.cardListView.cards.count() === 1);
        };
      })(this));
      this.cardListView.event('removed').subscribe((function(_this) {
        return function() {
          return _this.state.index(Math.min(_this.cardListView.cards.count() - 1, _this.state.index() + 1));
        };
      })(this));
      this.controls.find('button.zoom').event('click').subscribe((function(_this) {
        return function(event) {
          return _this.zoom(event);
        };
      })(this));
      this.cardListView.element.event('click', 'li.card').subscribe((function(_this) {
        return function(event) {
          return _this.unzoom(event);
        };
      })(this));
      this.controls.find('button.close').event('click').subscribe((function(_this) {
        return function() {
          return _this.cardListView.cards.remove(function(card) {
            return card.li.index('li.card') > 0;
          });
        };
      })(this));
      jm.disjoin(this.cardListView.event('ready'), this.cardListView.event('removed')).subscribe((function(_this) {
        return function() {
          var count;
          count = _this.cardListView.cards.count();
          return _this.controls.find('.count').text(count + ' card' + (count !== 1 ? 's' : ''));
        };
      })(this));
      jm.disjoin(this.cardListView.event('ready'), this.state.event('index')).map((function(_this) {
        return function() {
          return [_this.state.index(), _this.cardListView.cards.count()];
        };
      })(this)).subscribe((function(_this) {
        return function(_arg) {
          var count, index;
          index = _arg[0], count = _arg[1];
          _this.controls.find('.previous').toggleClass('disabled', count < 2 || index === 0);
          return _this.controls.find('.next').toggleClass('disabled', count < 2 || index === count - 1);
        };
      })(this));
      jm.disjoin(this.controls.find('.previous').event('click').tag(-1), this.controls.find('.next').event('click').tag(1)).where($.target(function() {
        return !this.hasClass('disabled');
      })).subscribe((function(_this) {
        return function(event, step) {
          return _this.state.index(function(value) {
            return value + step;
          });
        };
      })(this));
      this.controls.find('.list').closest('li').event('click', 'a').subscribe((function(_this) {
        return function(_arg) {
          var target;
          target = _arg.target;
          _this.state.index($(target).data('index'));
          _this.controls.find('.list').closest('li').children('div').fadeOut();
          return false;
        };
      })(this));
      this.controls.find('.list').event('click').subscribe((function(_this) {
        return function(_arg) {
          var div, list, target;
          target = _arg.target;
          div = $(target).closest('li').children('div');
          if (div.is(':visible')) {
            return div.fadeOut();
          } else {
            list = div.children('ul');
            list.children().remove();
            _this.cardListView.cards.each(function(card, index) {
              return list.append($("<li><a data-index='" + index + "' href='#'>" + card.title + "</a></li>"));
            });
            return div.fadeIn();
          }
        };
      })(this));
    }

    ViewPort.prototype.scrollTo = function(index, duration) {
      var li;
      if (duration == null) {
        duration = 1000;
      }
      li = this.cardListView.element.find('li.card').eq(index);
      if (li.length > 0) {
        return this.element.stop().animate({
          scrollLeft: Math.min(li.offset().left - this.offset, li.offset().left + li.width() - this.element.width() - this.offset) + 1 + 'px',
          scrollTop: '0px'
        }, duration);
      }
    };

    ViewPort.prototype.nudge = function() {
      var scrollLeft;
      scrollLeft = this.element.scrollLeft();
      return this.element.animate({
        scrollLeft: parseInt(scrollLeft, 10) + 200
      }, 500, (function(_this) {
        return function() {
          return jm.event.after(500).subscribe(function() {
            return _this.element.animate({
              scrollLeft: scrollLeft
            }, 500);
          });
        };
      })(this));
    };

    ViewPort.prototype.zoom = function(event) {
      this.element.addClass('zoomed');
      this.offsets = [];
      this.width = 0;
      this.cardListView.element.children('li').each((function(_this) {
        return function(index, item) {
          _this.offsets.push($(item).offset().left);
          return _this.width += $(item).outerWidth(true);
        };
      })(this));
      return after(1)((function(_this) {
        return function() {
          var scale;
          _this.scrollLeft = _this.element.scrollLeft();
          scale = _this.element.outerWidth() / _this.width;
          return _this.cardListView.element.css({
            'position': 'relative',
            '-webkit-transform': 'scale(' + scale + ')',
            'left': _this.scrollLeft
          });
        };
      })(this));
    };

    ViewPort.prototype.unzoom = function(_arg) {
      var target, targetIndex;
      target = _arg.target;
      if (this.element.hasClass('zoomed')) {
        targetIndex = $(target).closest('ul.cards > li').index();
        this.cardListView.element.css({
          '-webkit-transform': 'none',
          'left': this.scrollLeft - this.offsets[targetIndex] + 'px'
        });
        after(1)((function(_this) {
          return function() {
            return _this.element.removeClass('zoomed');
          };
        })(this));
        after(350)((function(_this) {
          return function() {
            _this.element.addClass('no_animation');
            _this.cardListView.element.css('left', '0px');
            _this.element.scrollLeft(Math.min(_this.offsets[targetIndex], _this.width - _this.element.width()));
            return after(10)(function() {
              return _this.element.removeClass('no_animation');
            });
          };
        })(this));
        return false;
      }
    };

    return ViewPort;

  })();
  Route = (function() {
    function Route(pattern, cardType) {
      var key;
      this.cardType = cardType;
      this.keys = (function() {
        var _i, _len, _ref, _results;
        _ref = pattern.match(/\{[^\}]+\}/g) || ['id'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          _results.push(key.replace('{', '').replace('}', '').replace('?', ''));
        }
        return _results;
      })();
      this.pattern = new RegExp('^' + String(pattern).replace('/', '\/').replace(/\/?\{[^\}]+\?\}/g, '(?:/?([^\/]+))?').replace(/\/?\{[^\}]+\}/g, '(?:/?([^\/]+))') + '/?$');
    }

    Route.prototype.test = function(path) {
      return this.pattern.test(path);
    };

    Route.prototype.match = function(path) {
      var index, key, keys, values, _, _i, _len, _ref, _ref1;
      _ref = this.pattern.exec(path), _ = _ref[0], values = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      keys = {};
      _ref1 = this.keys;
      for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
        key = _ref1[index];
        keys[key] = values != null ? values[index] : void 0;
      }
      return keys;
    };

    return Route;

  })();
  Router = (function() {
    function Router(routes) {
      this.routes = routes;
    }

    Router.prototype.resolve = function(url) {
      var keys, name, param, parameters, path, query, route, value, _, _i, _len, _ref, _ref1, _ref2;
      _ref = url.match(/([^\?]*)\??(.*)/), _ = _ref[0], path = _ref[1], query = _ref[2];
      route = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.routes;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          route = _ref1[_i];
          if (route.test(path)) {
            _results.push(route);
          }
        }
        return _results;
      }).call(this))[0];
      if (route) {
        keys = route.match(path);
        parameters = {};
        _ref1 = (function() {
          var _j, _len, _ref1, _results;
          _ref1 = query.split('&');
          _results = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            param = _ref1[_j];
            _results.push(param.split('='));
          }
          return _results;
        })();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          _ref2 = _ref1[_i], name = _ref2[0], value = _ref2[1];
          parameters[name] = value;
        }
      }
      return [route != null ? route.cardType : void 0, keys || {}, parameters || {}];
    };

    return Router;

  })();
  Controller = (function() {
    function Controller(cardList, view, viewport, element, router) {
      this.cardList = cardList;
      this.view = view;
      this.viewport = viewport;
      this.element = element;
      this.router = router;
      this.element.event('click', 'a[href]').notBetween($(document).event('keydown').where(jm.key(':leftcmd', ':ctrl')), $(document).event('keyup').where(jm.key(':leftcmd', ':ctrl'))).subscribe((function(_this) {
        return function(event) {
          return _this.handle(event, true);
        };
      })(this));
      this.element.event('click', 'a[href]').between($(document).event('keydown').where(jm.key(':leftcmd', ':ctrl')), $(document).event('keyup').where(jm.key(':leftcmd', ':ctrl'))).subscribe((function(_this) {
        return function(event) {
          return _this.handle(event, false);
        };
      })(this));
    }

    Controller.prototype.handle = function(_arg, animate) {
      var a, before, cardType, currentIndex, fragment, href, keys, li, open, parameters, path, protocol, target, _ref, _ref1;
      target = _arg.target;
      open = function(href) {
        return window.open(href, (Date()).split(' ').join(''));
      };
      a = $(target).closest('a');
      before = a.hasClass('before');
      href = a.attr('href');
      _ref = href.split('#'), path = _ref[0], fragment = _ref[1];
      protocol = href.split(':')[0];
      li = a.closest('li.card');
      currentIndex = li.length === 0 ? $('li.card').length : li.index('li.card') + 1;
      _ref1 = this.router.resolve(href), cardType = _ref1[0], keys = _ref1[1], parameters = _ref1[2];
      if (path === location.origin + location.pathname) {
        location.hash = '#' + fragment;
        $(document).scrollTop(0);
        return false;
      } else if (a.hasClass('permalink')) {
        open(href);
        return false;
      } else if (cardType) {
        if (a.is('.disabled')) {
          return false;
        }
        a.addClass('disabled');
        require([cardType], (function(_this) {
          return function(cardType) {
            var card;
            card = new cardType(_this.cardList, keys, void 0, parameters);
            card.url = href;
            if (card.li.hasClass('singleton') && li.hasClass('singleton') && _this.cardList.count() === 1) {
              _this.element.animate({
                scrollLeft: 0
              }, 500, function() {
                return _this.cardList.replace(_this.cardList.get(0), card);
              });
            } else {
              _this.cardList.insert(currentIndex + (before ? -1 : 0), card);
            }
            if (animate) {
              return _this.view.event('ready').where(function(inserted) {
                return inserted === card;
              }).subscribe(function() {
                a.removeClass('disabled');
                return _this.viewport.state.index(card.li.index('li.card'));
              });
            }
          };
        })(this));
      } else if (href[0] === '#' && (protocol !== 'mailto')) {
        history.pushState(null, null, window.location.pathname + href);
      } else if (protocol !== 'mailto' && protocol !== 'javascript') {
        open(href);
      }
      return protocol === 'mailto';
    };

    return Controller;

  })();
  Application = (function() {
    function Application(element, menuElement, external, constructors) {
      var card, cardType, keys, parameters, rootCardElement, route, _ref;
      this.external = external;
      this.constructors = constructors;
      this.element = $(element);
      this.menuElement = $(menuElement);
      this.events = new jm.EventRegistry('initialised', 'ready');
      this.event('initialised').remember(1);
      this.event('ready').remember(1);
      this.event('ready').subscribe((function(_this) {
        return function() {
          return _this.element.removeClass('loading');
        };
      })(this));
      this.cards = new List(this.external, this);
      this.router = new Router((function() {
        var _ref, _results;
        _ref = this.constructors;
        _results = [];
        for (route in _ref) {
          card = _ref[route];
          _results.push(new Route(route, card));
        }
        return _results;
      }).call(this));
      rootCardElement = this.element.find('ul.cards li.card')[0];
      _ref = this.router.resolve(window.location.pathname.substring(1)), cardType = _ref[0], keys = _ref[1], parameters = _ref[2];
      if (cardType == null) {
        cardType = require(this.constructors[0].card);
      }
      parameters.zoomed = rootCardElement == null;
      if (cardType) {
        require([cardType], (function(_this) {
          return function(cardType) {
            var rootCard;
            rootCard = new cardType(_this.cards, keys, $(rootCardElement), parameters);
            rootCard.event('ready').republish(_this.event('ready'));
            if (rootCardElement) {
              _this.cards.add(rootCard);
            }
            _this.view = new ListView(_this.cards, _this.element.find('ul.cards'));
            _this.viewport = new ViewPort(_this.view, _this.element, _this.menuElement, _this.external.offset != null);
            _this.controller = new Controller(_this.cards, _this.view, _this.viewport, _this.element, _this.router);
            if (!rootCardElement) {
              _this.cards.add(rootCard);
            }
            return _this.event('initialised').raise();
          };
        })(this));
      }
    }

    Application.prototype.event = function(name) {
      return this.events.get(name);
    };

    return Application;

  })();
  return {
    Card: Card,
    AjaxCard: AjaxCard,
    List: List,
    ListView: ListView,
    ViewPort: ViewPort,
    Route: Route,
    Router: Router,
    Controller: Controller,
    Application: Application
  };
});

//# sourceMappingURL=cards.map
