// Generated by CoffeeScript 1.3.3
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

define(['jquery', 'jmodel/topaz', 'jmodel-plugins/jquery.emerald', 'jmodel-plugins/emerald.keys'], function($, jm) {
  var AjaxCard, Application, Card, Controller, List, ListView, Route, Router, ViewPort, after;
  after = function(period) {
    return function(fn) {
      return jm.event.after(period).subscribe(fn);
    };
  };
  Card = (function() {

    function Card() {
      var _ref,
        _this = this;
      this.events = new jm.EventRegistry('ready', 'dispose');
      this.event('ready').remember(1);
      if ((_ref = this.li) == null) {
        this.li = $('<li class="card"/>');
      }
      this.li.addClass(this["class"]);
      this.li.on('click', 'button.close', function() {
        return _this.event('dispose').raise(_this);
      });
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
      var _this = this;
      AjaxCard.__super__.constructor.call(this);
      this.events.add('load', jm.event.fromAjax(this.load));
      this.event('load').subscribe(function(html) {
        return _this.init(html);
      });
    }

    AjaxCard.prototype.get = function(params) {
      return this.event('load').start(params);
    };

    AjaxCard.prototype.init = function(html) {
      this.li.html(html);
      this.li.toggleClass('error', $(html).hasClass('error'));
      return this.event('ready').raise(this);
    };

    return AjaxCard;

  })(Card);
  List = (function() {

    function List(external) {
      var _this = this;
      this.external = external;
      this.cards = new jm.ObservableTypedList(Card);
      this.events = new jm.EventRegistry('add', 'insert', 'replace', 'remove', 'count', 'ready');
      this.event('ready').remember(1);
      this.cards.events.republish({
        add: this.event('add'),
        insert: this.event('insert'),
        replace: this.event('replace'),
        remove: this.event('remove')
      });
      jm.disjoin(this.cards.event('add'), this.cards.event('insert'), this.cards.event('replace')).subscribe(function(card) {
        card.event('ready').subscribe(function() {
          return _this.event('ready').raise(card);
        });
        return card.event('dispose').subscribe(function(card) {
          return _this.cards.remove(card);
        });
      });
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

    return List;

  })();
  ListView = (function() {

    function ListView(cards, element, duration) {
      var _this = this;
      this.cards = cards;
      this.duration = duration != null ? duration : 750;
      this.element = $(element);
      this.events = new jm.EventRegistry('ready', 'removed');
      this.cards.events.subscribe({
        add: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.add.apply(_this, args);
        },
        insert: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.insert.apply(_this, args);
        },
        replace: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.replace.apply(_this, args);
        },
        remove: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.remove.apply(_this, args);
        }
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
      var _this = this;
      this.element.find('li.card').removeClass('zoomed');
      this.element.append('<li class="extent"><ul><li class="label hidden"></li></ul></li>');
      return card.event('ready').take(1).subscribe(function() {
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
      });
    };

    ListView.prototype.insert = function(card, index) {
      var cards,
        _this = this;
      cards = this.element.find('li.card');
      cards.removeClass('zoomed');
      this.element.find('li.extent > ul > li.label').removeClass('hidden');
      return card.event('ready').take(1).subscribe(function() {
        var li;
        li = card.li;
        li.addClass('adding');
        return after(350)(function() {
          _this.element.find('li.card').eq(index - 1).after(li);
          li.css('width', li.children('article').outerWidth(true));
          return after(_this.duration)(function() {
            li.removeClass('adding');
            return _this.event('ready').raise(card);
          });
        });
      });
    };

    ListView.prototype.replace = function(before, card) {
      var _this = this;
      return card.event('ready').take(1).subscribe(function() {
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
      });
    };

    ListView.prototype.remove = function(card) {
      var li,
        _this = this;
      li = card.li;
      li.children().addClass('removing');
      return after(this.duration)(function() {
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
      });
    };

    return ListView;

  })();
  ViewPort = (function() {

    ViewPort.offsets = [];

    ViewPort.width = 0;

    ViewPort.scrollLeft = 0;

    function ViewPort(cardListView, element, controls) {
      var keyEvent,
        _this = this;
      this.cardListView = cardListView;
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
      this.state.event('index').subscribe(function(index) {
        return _this.scrollTo(index);
      });
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
      })).subscribe(function(_arg) {
        var target;
        target = _arg.target;
        return _this.state.index(target.closest('li.card').index('li.card'));
      });
      keyEvent = this.element.event('keydown').where(function(_arg) {
        var target;
        target = _arg.target;
        return $(target).closest('input,select,textarea,[contentEditable=true]').length === 0;
      });
      jm.disjoin(keyEvent.where(jm.key(':left')).map(function() {
        return -1;
      }), keyEvent.where(jm.key(':right')).map(function() {
        return 1;
      })).subscribe(function(step) {
        _this.state.index(Math.max(0, Math.min(_this.cardListView.cards.count() - 1, _this.state.index() + step)));
        return false;
      });
      jm.disjoin(this.cardListView.event('ready'), this.cardListView.event('removed')).subscribe(function() {
        return _this.controls.toggleClass('hidden', _this.cardListView.cards.count() === 1);
      });
      this.cardListView.event('removed').subscribe(function() {
        return _this.state.index(Math.min(_this.cardListView.cards.count() - 1, _this.state.index() + 1));
      });
      this.controls.find('button.zoom').event('click').subscribe(function(event) {
        return _this.zoom(event);
      });
      this.cardListView.element.event('click', 'li.card').subscribe(function(event) {
        return _this.unzoom(event);
      });
      this.controls.find('button.close').event('click').subscribe(function() {
        return _this.cardListView.cards.remove(function(card) {
          return card.li.index('li.card') > 0;
        });
      });
      jm.disjoin(this.cardListView.event('ready'), this.cardListView.event('removed')).subscribe(function() {
        var count;
        count = _this.cardListView.cards.count();
        return _this.controls.find('.count').text(count + ' cards');
      });
      this.element.event('mousemove').map(function(event) {
        return event.screenX;
      }).between(this.element.event('mousedown').map(function(event) {
        return [event.screenX, $(window).scrollLeft()];
      }), $(document).event('mouseup')).subscribe(function(currentScreenX, _arg) {
        var startScreenX, startScroll;
        startScreenX = _arg[0], startScroll = _arg[1];
        return $(window).scrollLeft(startScroll + startScreenX - currentScreenX);
      });
    }

    ViewPort.prototype.scrollTo = function(index, duration) {
      var li;
      if (duration == null) {
        duration = 1000;
      }
      li = this.cardListView.element.find('li.card').eq(index);
      if (li.length > 0) {
        return this.element.animate({
          scrollLeft: Math.max(li.offset().left - 64, li.offset().left + li.width() - this.element.width() - 64) + 'px',
          scrollTop: '0px'
        }, duration);
      }
    };

    ViewPort.prototype.zoom = function(event) {
      var _this = this;
      this.element.addClass('zoomed');
      this.offsets = [];
      this.width = 0;
      this.cardListView.element.children('li').each(function(index, item) {
        _this.offsets.push($(item).offset().left);
        return _this.width += $(item).outerWidth(true);
      });
      return after(1)(function() {
        var scale;
        _this.scrollLeft = _this.element.scrollLeft();
        scale = _this.element.outerWidth() / _this.width;
        return _this.cardListView.element.css({
          'position': 'relative',
          '-webkit-transform': 'scale(' + scale + ')',
          'left': _this.scrollLeft
        });
      });
    };

    ViewPort.prototype.unzoom = function(_arg) {
      var target, targetIndex,
        _this = this;
      target = _arg.target;
      if (this.element.hasClass('zoomed')) {
        targetIndex = $(target).closest('ul.cards > li').index();
        this.cardListView.element.css({
          '-webkit-transform': 'none',
          'left': this.scrollLeft - this.offsets[targetIndex] + 'px'
        });
        after(1)(function() {
          return _this.element.removeClass('zoomed');
        });
        after(350)(function() {
          _this.element.addClass('no_animation');
          _this.cardListView.element.css('left', '0px');
          _this.element.scrollLeft(Math.min(_this.offsets[targetIndex], _this.width - _this.element.width()));
          return after(10)(function() {
            return _this.element.removeClass('no_animation');
          });
        });
        return false;
      }
    };

    return ViewPort;

  })();
  Route = (function() {

    function Route(pattern, cardType) {
      this.cardType = cardType;
      this.pattern = pattern instanceof RegExp ? pattern : this.compile(pattern);
    }

    Route.prototype.compile = function(pattern) {
      return new RegExp('^' + String(pattern).replace('/', '\/').replace(/\{[^\}]+\}/, '(\\d+)') + '/?$');
    };

    return Route;

  })();
  Router = (function() {

    function Router(routes) {
      this.routes = routes;
      this.routes.sort((function(route) {
        return route.pattern.toString().length;
      }).desc());
    }

    Router.prototype.resolve = function(url) {
      var keys, name, param, parameters, path, query, route, value, _, _i, _len, _ref, _ref1, _ref2, _ref3;
      _ref = url.match(/([^\?]*)\??(.*)/), _ = _ref[0], path = _ref[1], query = _ref[2];
      route = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.routes;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          route = _ref1[_i];
          if (route.pattern.test(path)) {
            _results.push(route);
          }
        }
        return _results;
      }).call(this))[0];
      if (route) {
        _ref1 = route.pattern.exec(path), _ = _ref1[0], keys = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
        parameters = {};
        _ref2 = (function() {
          var _j, _len, _ref2, _results;
          _ref2 = query.split('&');
          _results = [];
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            param = _ref2[_j];
            _results.push(param.split('='));
          }
          return _results;
        })();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          _ref3 = _ref2[_i], name = _ref3[0], value = _ref3[1];
          parameters[name] = value;
        }
      }
      return [route != null ? route.cardType : void 0, keys || [], parameters || {}];
    };

    return Router;

  })();
  Controller = (function() {

    function Controller(cardList, view, viewport, element, router) {
      var _this = this;
      this.cardList = cardList;
      this.view = view;
      this.viewport = viewport;
      this.element = element;
      this.router = router;
      this.element.event('click', 'a[href]').notBetween($(document).event('keydown').where(jm.key(':leftcmd', ':ctrl')), $(document).event('keyup').where(jm.key(':leftcmd', ':ctrl'))).subscribe(function(event) {
        return _this.handle(event, true);
      });
      this.element.event('click', 'a[href]').between($(document).event('keydown').where(jm.key(':leftcmd', ':ctrl')), $(document).event('keyup').where(jm.key(':leftcmd', ':ctrl'))).subscribe(function(event) {
        return _this.handle(event, false);
      });
    }

    Controller.prototype.handle = function(_arg, animate) {
      var a, card, cardType, currentIndex, href, id, li, open, parameters, target, _ref, _ref1,
        _this = this;
      target = _arg.target;
      open = function(href) {
        return window.open(href, (Date()).split(' ').join(''));
      };
      a = $(target).closest('a');
      href = a.attr('href');
      li = a.closest('li.card');
      currentIndex = li.index('li.card') + 1;
      _ref = this.router.resolve(href), cardType = _ref[0], (_ref1 = _ref[1], id = _ref1[0]), parameters = _ref[2];
      if (a.hasClass('permalink')) {
        open(href);
        return false;
      } else if (cardType) {
        card = new cardType(this.cardList, id, void 0, parameters);
        if (card.li.hasClass('singleton') && li.hasClass('singleton') && this.cardList.count() === 1) {
          this.element.animate({
            scrollLeft: 0
          }, 500, function() {
            return _this.cardList.replace(_this.cardList.get(0), card);
          });
        } else {
          this.cardList.insert(currentIndex, card);
        }
      } else {
        open(href);
      }
      if (animate) {
        this.view.event('ready').where(function(inserted) {
          return inserted === card;
        }).subscribe(function() {
          return _this.viewport.state.index(card.li.index('li.card'));
        });
      }
      return false;
    };

    return Controller;

  })();
  Application = (function() {

    function Application(element, menuElement, external, constructors) {
      var card, cardType, rootCard, rootCardElement,
        _this = this;
      this.external = external;
      this.constructors = constructors;
      this.element = $(element);
      this.menuElement = $(menuElement);
      this.events = new jm.EventRegistry('ready');
      this.event('ready').remember(1);
      this.event('ready').subscribe(function() {
        return _this.element.removeClass('loading');
      });
      this.cards = new List(this.external);
      this.router = new Router((function() {
        var _i, _len, _ref, _results;
        _ref = this.constructors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          card = _ref[_i];
          _results.push(new Route(card.prototype.route, card));
        }
        return _results;
      }).call(this));
      rootCardElement = this.element.find('ul.cards li.card');
      cardType = this.router.resolve(window.location.pathname.substring(1))[0];
      rootCard = new cardType(this.cards, void 0, rootCardElement, {
        zoomed: !(rootCardElement != null)
      });
      rootCard.event('ready').republish(this.event('ready'));
      if (rootCardElement) {
        this.cards.add(rootCard);
      }
      this.view = new ListView(this.cards, this.element.find('ul.cards'));
      this.viewport = new ViewPort(this.view, this.element, this.menuElement);
      this.controller = new Controller(this.cards, this.view, this.viewport, this.element, this.router);
      if (!rootCardElement) {
        this.cards.add(rootCard);
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
