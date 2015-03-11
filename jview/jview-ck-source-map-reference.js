(function(){var t={}.hasOwnProperty,e=function(e,n){function r(){this.constructor=e}for(var i in n)t.call(n,i)&&(e[i]=n[i]);return r.prototype=n.prototype,e.prototype=new r,e.__super__=n.prototype,e},n=[].slice,r=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};define("jview/cards",function(t){var $,r,i,s,o,a,u,c,l,d,h,f;return $=t("jquery"),f=t("jmodel/topaz"),t("jmodel-plugins/jquery.emerald"),t("jmodel-plugins/emerald.keys"),h=function(t){return function(e){return f.event.after(t).subscribe(e)}},$.target=function(t){return function(e){var n;return n=e.target,t.call($(n))}},s=function(){function t(){this.events=new f.EventRegistry("ready","dispose","current"),this.event("ready").remember(1),this.li=$(this.li?this.li:'<li class="card"/>'),this.li.addClass(this["class"]),this.li.event("click",".close").subscribe(function(t){return function(){return t.event("dispose").raise(t),!1}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t}(),r=function(t){function n(){n.__super__.constructor.call(this),this.events.add("load",f.event.fromAjax(this.load)),this.event("load").subscribe(function(t){return function(e){return t.init(e)}}(this))}return e(n,t),n.prototype["class"]="",n.prototype.load=null,n.prototype.get=function(t){return this.event("load").start(t)},n.prototype.init=function(t){return this.li.html(t),this.li.toggleClass("error",$(t).hasClass("error")),this.url=this.li.children("article").data("url"),this.event("ready").raise(this)},n}(s),a=function(){function t(t,e){this.external=t,this.application=e,this.cards=new f.ObservableTypedList(s),this.events=new f.EventRegistry("add","insert","replace","remove","count","ready"),this.event("ready").remember(1),this.cards.events.republish({add:this.event("add"),insert:this.event("insert"),replace:this.event("replace"),remove:this.event("remove")}),f.disjoin(this.cards.event("add"),this.cards.event("insert"),this.cards.event("replace").map(function(t,e){return e})).subscribe(function(t){return function(e){return e.event("ready").subscribe(function(e){return t.event("ready").raise(e)}),e.event("dispose").subscribe(function(e){return t.cards.remove(e)})}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.add=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).add.apply(e,t)},t.prototype.insert=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).insert.apply(e,t)},t.prototype.replace=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).replace.apply(e,t)},t.prototype.remove=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).remove.apply(e,t)},t.prototype.get=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).get.apply(e,t)},t.prototype.count=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).count.apply(e,t)},t.prototype.first=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).first.apply(e,t)},t.prototype.each=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).each.apply(e,t)},t.prototype.map=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).map.apply(e,t)},t}(),u=function(){function t(t,e,r){this.cards=t,this.duration=null!=r?r:750,this.element=$(e),this.events=new f.EventRegistry("ready","removed"),this.cards.events.subscribe({add:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.add.apply(t,e)}}(this),insert:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.insert.apply(t,e)}}(this),replace:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.replace.apply(t,e)}}(this),remove:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.remove.apply(t,e)}}(this)})}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.fold=function(){return this.element.find("li.card").each(function(t,e){return $(e).css({"-webkit-transform":"rotate("+(4*(t%2)-2)+"deg)",left:-1*$(e).position().left+100*t+"px"})})},t.prototype.add=function(t){return 0===t.li.closest("ul.cards").length?t.event("ready").take(1).subscribe(function(e){return function(){return t.li.children().addClass("adding"),h(1)(function(){return e.element.append(t.li),h(1)(function(){return t.li.children().removeClass("adding"),e.event("ready").raise(t)})})}}(this)):this.event("ready").raise(t)},t.prototype.insert=function(t,e){var n;return n=t.li,n.addClass("adding"),0===e?this.element.find("li.card").eq(0).before(n):this.element.find("li.card").eq(e-1).after(n),t.event("ready").take(1).subscribe(function(e){return function(){return h(1)(function(){var r;return r=Math.min(window.innerWidth,n.children("article").outerWidth(!0)),n.css("width",r),h(1)(function(){return n.removeClass("adding"),e.event("ready").raise(t)})})}}(this))},t.prototype.replace=function(t,e){return e.event("ready").take(1).subscribe(function(n){return function(){return t.li.removeClass("zoomed").after(e.li),e.li.removeClass("zoomed"),h(n.duration)(function(){return $("body").animate({scrollLeft:$("body").width()},1e3,function(){return t.li.remove(),e.li.addClass("zoomed"),h(350)(function(){return n.event("ready").raise(e)})})})}}(this))},t.prototype.remove=function(t){var e;return e=t.li,e.children().addClass("removing"),h(this.duration)(function(n){return function(){return e.addClass("removing"),h(1)(function(){return e.remove().removeClass("removing"),e.children().removeClass("removing"),n.event("removed").raise(t)})}}(this))},t}(),d=function(){function t(t,e,n,r){var i;this.cardListView=t,this.offset=null!=r?r:64,this.element=$(e),this.controls=$(n),this.state=new f.ObservableObject({index:{type:Number,defaultValue:0,remember:1,repeat:!0}}),this.state.event("index").subscribe(function(t){return function(e){return t.scrollTo(e)}}(this)),this.state.event("index").subscribe(function(t){return function(e){var n,r;return null!=(n=t.cardListView.cards.get(e))&&"function"==typeof n.event&&null!=(r=n.event("current"))?r.raise():void 0}}(this)),f.conjoin(this.cardListView.element.event("mousedown","li.card"),this.cardListView.element.event("mouseup","li.card")).map(function(t,e){return{target:$(t.target),deltaX:e.screenX-t.screenX,deltaY:e.screenY-t.screenY}}).where(Function.and(function(t){var e;return e=t.target,0===e.closest("a").length},function(t){var e;return e=t.deltaX,e>-3&&3>e},function(t){var e;return e=t.deltaY,e>-3&&3>e})).subscribe(function(t){return function(e){var n,r;return n=e.target,r=n.closest("li.card").index("li.card"),r!==t.state.index()?t.state.index(n.closest("li.card").index("li.card")):void 0}}(this)),i=$(document).event("keydown").where(function(t){var e;return e=t.target,0===$(e).closest("input,select,textarea,[contentEditable=true]").length}),f.disjoin(i.where(f.key(":left")).map(function(){return-1}),i.where(f.key(":right")).map(function(){return 1})).subscribe(function(t){return function(e){return t.state.index(Math.max(0,Math.min(t.cardListView.cards.count()-1,t.state.index()+e))),!1}}(this)),f.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(t){return function(){return t.controls.toggleClass("hidden",1===t.cardListView.cards.count())}}(this)),this.cardListView.event("removed").subscribe(function(t){return function(){return t.state.index(Math.min(t.cardListView.cards.count()-1,t.state.index()+1))}}(this)),this.controls.find("button.zoom").event("click").subscribe(function(t){return function(e){return t.zoom(e)}}(this)),this.cardListView.element.event("click","li.card").subscribe(function(t){return function(e){return t.unzoom(e)}}(this)),this.controls.find("button.close").event("click").subscribe(function(t){return function(){return t.cardListView.cards.remove(function(t){return t.li.index("li.card")>0})}}(this)),f.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(t){return function(){var e;return e=t.cardListView.cards.count(),t.controls.find(".count").text(e+" card"+(1!==e?"s":""))}}(this)),f.disjoin(this.cardListView.event("ready"),this.state.event("index")).map(function(t){return function(){return[t.state.index(),t.cardListView.cards.count()]}}(this)).subscribe(function(t){return function(e){var n,r;return r=e[0],n=e[1],t.controls.find(".previous").toggleClass("disabled",2>n||0===r),t.controls.find(".next").toggleClass("disabled",2>n||r===n-1)}}(this)),f.disjoin(this.controls.find(".previous").event("click").tag(-1),this.controls.find(".next").event("click").tag(1)).where($.target(function(){return!this.hasClass("disabled")})).subscribe(function(t){return function(e,n){return t.state.index(function(t){return t+n})}}(this)),this.controls.find(".list").closest("li").event("click","a").subscribe(function(t){return function(e){var n;return n=e.target,t.state.index($(n).data("index")),t.controls.find(".list").closest("li").children("div").fadeOut(),!1}}(this)),this.controls.find(".list").event("click").subscribe(function(t){return function(e){var n,r,i;return i=e.target,n=$(i).closest("li").children("div"),n.is(":visible")?n.fadeOut():(r=n.children("ul"),r.children().remove(),t.cardListView.cards.each(function(t,e){return r.append($("<li><a data-index='"+e+"' href='#'>"+t.title+"</a></li>"))}),n.fadeIn())}}(this))}return t.offsets=[],t.width=0,t.scrollLeft=0,t.prototype.scrollTo=function(t,e){var n;return null==e&&(e=300),n=this.cardListView.element.find("li.card").eq(t),n.length>0?this.element.stop().animate({scrollLeft:this.element.scrollLeft()+n.position().left+parseInt(n.css("margin-left"),10)+"px"},e):void 0},t.prototype.nudge=function(){var t;return t=this.element.scrollLeft(),this.element.animate({scrollLeft:parseInt(t,10)+200},500,function(e){return function(){return f.event.after(500).subscribe(function(){return e.element.animate({scrollLeft:t},500)})}}(this))},t.prototype.zoom=function(t){return this.element.addClass("zoomed"),this.offsets=[],this.width=0,this.cardListView.element.children("li").each(function(t){return function(e,n){return t.offsets.push($(n).position().left),t.width+=$(n).outerWidth(!0)}}(this)),h(1)(function(t){return function(){var e;return t.scrollLeft=t.element.scrollLeft(),e=t.element.outerWidth()/t.width,t.cardListView.element.css({position:"relative","-webkit-transform":"scale("+e+")",left:t.scrollLeft})}}(this))},t.prototype.unzoom=function(t){var e,n;return e=t.target,this.element.hasClass("zoomed")?(n=$(e).closest("ul.cards > li").index(),this.cardListView.element.css({"-webkit-transform":"none",left:this.scrollLeft-this.offsets[n]+"px"}),h(1)(function(t){return function(){return t.element.removeClass("zoomed")}}(this)),h(350)(function(t){return function(){return t.element.addClass("no_animation"),t.cardListView.element.css("left","0px"),t.element.scrollLeft(Math.min(t.offsets[n],t.width-t.element.width())),h(10)(function(){return t.element.removeClass("no_animation")})}}(this)),!1):void 0},t}(),c=function(){function t(t,e){var n;this.cardType=e,this.keys=function(){var e,r,i,s;for(i=t.match(/\{[^\}]+\}/g)||["id"],s=[],e=0,r=i.length;r>e;e++)n=i[e],s.push(n.replace("{","").replace("}","").replace("?",""));return s}(),this.pattern=new RegExp("^"+String(t).replace("/","/").replace(/\/?\{[^\}]+\?\}/g,"(?:/?([^/]+))?").replace(/\/?\{[^\}]+\}/g,"(?:/?([^/]+))")+"/?$")}return t.prototype.test=function(t){return this.pattern.test(t)},t.prototype.match=function(t){var e,r,i,s,o,a,u,c,l;for(c=this.pattern.exec(t),o=c[0],s=2<=c.length?n.call(c,1):[],i={},l=this.keys,e=a=0,u=l.length;u>a;e=++a)r=l[e],i[r]=null!=s?s[e]:void 0;return i},t}(),l=function(){function t(t){this.routes=t}return t.prototype.resolve=function(t){var e,n,r,i,s,o,a,u,c,l,d,h,f,v,p,m;if(f=t.split("#"),t=f[0],e=f[1],v=t.match(/([^\?]*)\??(.*)/),l=v[0],o=v[1],a=v[2],u=function(){var t,e,n,r;for(n=this.routes,r=[],t=0,e=n.length;e>t;t++)u=n[t],u.test(o)&&r.push(u);return r}.call(this)[0])for(n=u.match(o),s={fragment:e},p=function(){var t,e,n,r;for(n=a.split("&"),r=[],t=0,e=n.length;e>t;t++)i=n[t],r.push(i.split("="));return r}(),d=0,h=p.length;h>d;d++)m=p[d],r=m[0],c=m[1],s[r]=c;return[null!=u?u.cardType:void 0,n||{},s||{}]},t}(),o=function(){function e(t,e,n,r,i){this.cardList=t,this.view=e,this.viewport=n,this.element=r,this.router=i,$(document).event("click","a[href]").notBetween($(document).event("keydown").where(f.key(":leftcmd",":ctrl")),$(document).event("keyup").where(f.key(":leftcmd",":ctrl"))).subscribe(function(t){return function(e){return t.handle(e,!0)}}(this)),$(document).event("click","a[href]").between($(document).event("keydown").where(f.key(":leftcmd",":ctrl")),$(document).event("keyup").where(f.key(":leftcmd",":ctrl"))).subscribe(function(t){return function(e){return t.handle(e,!1)}}(this))}return e.prototype.handle=function(e,n){var r,i,s,o,a,u,c,l,d,h,v,p,m,g,y,b,w,L,x,C;if(b=e.target,v=function(t){return window.open(t,Date().split(" ").join(""))},r=$(b).closest("a"),i=r.hasClass("before"),u=r.attr("href"),x=u.match(/([^#\?]*)((?:#)[^\?]*)?(\?.*)?/)||[],L=x[0],m=x[1],a=x[2],y=x[3],g=(u.match(/^([^:\?]*):.*/)||["https"])[0],d=r.closest("li.card"),c=new f.List,w="https://"+location.host+"/"+m,this.cardList.each(function(t,e){var n;return n=this.url.split("#")[0],c.add([e,n===w])}),h=c.first(function(t){var e,n;return n=t[0],e=t[1]}),null!=h)return this.viewport.state.index(h[0]),!1;if(o=0===d.length?$("li.card").length:d.index("li.card")+1,("http"===g||"https"===g)&&(C=this.router.resolve(m),s=C[0],l=C[1],p=C[2]),p=p||{},p.location={protocol:g,path:m,fragment:a,query:y},m===location.origin+location.pathname)return location.hash="#"+a,$(document).scrollTop(0),!1;if(r.attr("download"))return!0;if(r.hasClass("permalink"))return v(u),!1;if(null!=s){if(r.is(".disabled"))return!1;r.addClass("disabled"),t([s],function(t){return function(e){var s;return s=new e(t.cardList,l,void 0,p),s.url=u,s.li.hasClass("singleton")&&d.hasClass("singleton")&&1===t.cardList.count()?t.element.animate({scrollLeft:0},500,function(){return t.cardList.replace(t.cardList.get(0),s)}):t.cardList.insert(o+(i?-1:0),s),n?t.view.event("ready").where(function(t){return t===s}).subscribe(function(){return r.removeClass("disabled"),t.viewport.state.index(s.li.index("li.card"))}):void 0}}(this))}else"#"===u[0]&&"mailto"!==g?history.pushState(null,null,window.location.pathname+u):"mailto"!==g&&"javascript"!==g&&v(u);return"mailto"===g},e}(),i=function(){function e(e,n,r,i){var s,h;this.external=r,this.constructors=i,this.element=$(e),this.menuElement=$(n),this.events=new f.EventRegistry("initialised","ready"),this.event("initialised").remember(1),this.event("ready").remember(1),this.event("ready").subscribe(function(t){return function(){return t.element.removeClass("loading")}}(this)),this.cards=new a(this.external,this),this.router=new l(function(){var t,e;t=this.constructors,e=[];for(h in t)s=t[h],e.push(new c(h,s));return e}.call(this)),this.view=new u(this.cards,this.element),this.viewport=new d(this.view,this.element,this.menuElement,null!=this.external.offset),this.controller=new o(this.cards,this.view,this.viewport,this.element,this.router),this.element.children("li.card").each(function(e){return function(n,r){var i,o,a,u,c;return u=$(r).data("url"),c=e.router.resolve(u),i=c[0],o=c[1],a=c[2],t([i],function(t){return s=new t(e.cards,o,$(r),a),e.cards.add(s),e.viewport.state.index(e.cards.count()),e.cards.cards.count()===e.element.children("li.card").length?(e.cards.each(function(t){return t.event("ready").republish(e.event("ready"))}),e.event("initialised").raise()):void 0})}}(this))}return e.prototype.event=function(t){return this.events.get(t)},e}(),{Card:s,AjaxCard:r,List:a,ListView:u,ViewPort:d,Route:c,Router:l,Controller:o,Application:i}}),define("jview/drag",function(t){var $,e,n,i;return $=t("jquery"),i=t("jmodel/emerald"),t("jmodel-plugins/jquery.emerald"),e=function(){function t(t,e){this.element=$(t),this.extractors=new i.List.fromArray(e),this.element.find("*").attr("draggable",!1),this.element.attr("draggable",!0).event("dragstart").subscribe(function(t){return function(e){var n,r,i;return i=e.originalEvent,n=i.dataTransfer,r=e.target,n.dropEffect="none",t.extractors.each(function(t){var e,i,s;return s=t($(r)),i=s[0],e=s[1],n.setData(i,/json/.test(i)?JSON.stringify(e):e)})}}(this))}return t}(),n=function(){function t(t){var e,n;e=t.element,n=t.types,this.effect=t.effect,this.element=$(e),this.types=new i.List.fromArray(n),this.events=new i.EventRegistry("drop"),i.disjoin(this.element.event("dragenter",{preventDefault:!0}).where(function(t){return function(e){var n;return n=e.originalEvent.dataTransfer,t.accept(n)}}(this)).map(function(){return 1}),this.element.event("dragleave",{preventDefault:!0}).where(function(t){return function(e){var n;return n=e.originalEvent.dataTransfer,t.accept(n)}}(this)).map(function(){return-1}),this.element.event("drop",{preventDefault:!0}).map(function(){return 1})).accumulate(i.plus,0).subscribe(function(t){return function(e){return t.element.toggleClass("over",e>0)}}(this)),this.element.event("dragover",{preventDefault:!0}).map(function(t){var e;return e=t.originalEvent.dataTransfer}).where(function(t){return function(e){return t.accept(e)}}(this)).subscribe(function(t){return function(e){return e.dropEffect=t.effect,!1}}(this)),this.element.event("drop",{stopPropagation:!0}).map(function(t){var e;return e=t.originalEvent.dataTransfer}).subscribe(function(t){return function(e){return t.element.removeClass("over"),t.types.each(function(n){var r;return r=e.getData(n),""!==r?t.event("drop").raise(/json/.test(n)?JSON.parse(r):r,n):void 0}),!1}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.accept=function(t){return this.types.exists(function(e){return r.call(t.types,e)>=0})},t}(),{Source:e,Target:n}}),define("jview/hierarchy",function(t){var $,e,n,r;return $=t("jquery"),r=t("jmodel/topaz"),e=function(){function t(t){this.title=t.title,this.href=t.href,this.tail=t.tail}return t}(),n=function(){function t(t){this.element=$(t)}return t.prototype.renderNodes=function(t,e){return this.element.children("li").filter(function(t){return t>=e}).remove(),this.renderNode(t)},t.prototype.renderNode=function(t){return t&&(this.element.append($("<li/>").append($('<a class="singleton"/>').attr("href",t.href).text(t.title))),t.tail)?this.renderNode(t.tail):void 0},t}(),{Node:e,View:n}}),define("jview/palettes",function(t){var $,e,n;return $=t("jquery"),n=t("jmodel/topaz"),t("jmodel-plugins/jquery.emerald"),e=function(){function t(t,e,r){var i,s,o,a;this.parameters=e,this.constructors=r,this.dl=$(t),this.dt=this.dl.children("dt"),this.state=new n.ObservableObject({current:Number,open:Boolean(!1)},{repeat:!0}),this.palettes=function(){var t,e;t=this.constructors,e=[];for(i in t)s=t[i],o=this.dl.children("dd").filter(i),a=o.prev("dt"),e.push(new s(a,o,this));return e}.call(this),this.dt.event("click").map(function(t){return function(t){var e;return e=t.target,Math.floor($(e).index()/2)}}(this)).subscribe(function(t){return function(e){return t.state.current(e),t.state.open(function(t){return!t})}}(this)),this.state.event("open").subscribe(function(t){return function(e){return t.dt.each(function(n,r){return n!==t.state.current()?$(r).removeClass("open"):$(r).toggleClass("open",e)})}}(this))}return t}(),{Palettes:e}}),define("jview/cards",function(t){var $,r,i,s,o,a,u,c,l,d,h,f;return $=t("jquery"),f=t("jmodel/topaz"),t("jmodel-plugins/jquery.emerald"),t("jmodel-plugins/emerald.keys"),h=function(t){return function(e){return f.event.after(t).subscribe(e)}},$.target=function(t){return function(e){var n;return n=e.target,t.call($(n))}},s=function(){function t(){this.events=new f.EventRegistry("ready","dispose","current"),this.event("ready").remember(1),this.li=$(this.li?this.li:'<li class="card"/>'),this.li.addClass(this["class"]),this.li.event("click",".close").subscribe(function(t){return function(){return t.event("dispose").raise(t),!1}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t}(),r=function(t){function n(){n.__super__.constructor.call(this),this.events.add("load",f.event.fromAjax(this.load)),this.event("load").subscribe(function(t){return function(e){return t.init(e)}}(this))}return e(n,t),n.prototype["class"]="",n.prototype.load=null,n.prototype.get=function(t){return this.event("load").start(t)},n.prototype.init=function(t){return this.li.html(t),this.li.toggleClass("error",$(t).hasClass("error")),this.url=this.li.children("article").data("url"),this.event("ready").raise(this)},n}(s),a=function(){function t(t,e){this.external=t,this.application=e,this.cards=new f.ObservableTypedList(s),this.events=new f.EventRegistry("add","insert","replace","remove","count","ready"),this.event("ready").remember(1),this.cards.events.republish({add:this.event("add"),insert:this.event("insert"),replace:this.event("replace"),remove:this.event("remove")}),f.disjoin(this.cards.event("add"),this.cards.event("insert"),this.cards.event("replace").map(function(t,e){return e})).subscribe(function(t){return function(e){return e.event("ready").subscribe(function(e){return t.event("ready").raise(e)}),e.event("dispose").subscribe(function(e){return t.cards.remove(e)})}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.add=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).add.apply(e,t)},t.prototype.insert=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).insert.apply(e,t)},t.prototype.replace=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).replace.apply(e,t)},t.prototype.remove=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).remove.apply(e,t)},t.prototype.get=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).get.apply(e,t)},t.prototype.count=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).count.apply(e,t)},t.prototype.first=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).first.apply(e,t)},t.prototype.each=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).each.apply(e,t)},t.prototype.map=function(){var t,e;return t=1<=arguments.length?n.call(arguments,0):[],(e=this.cards).map.apply(e,t)},t}(),u=function(){function t(t,e,r){this.cards=t,this.duration=null!=r?r:750,this.element=$(e),this.events=new f.EventRegistry("ready","removed"),this.cards.events.subscribe({add:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.add.apply(t,e)}}(this),insert:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.insert.apply(t,e)}}(this),replace:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.replace.apply(t,e)}}(this),remove:function(t){return function(){var e;return e=1<=arguments.length?n.call(arguments,0):[],t.remove.apply(t,e)}}(this)})}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.fold=function(){return this.element.find("li.card").each(function(t,e){return $(e).css({"-webkit-transform":"rotate("+(4*(t%2)-2)+"deg)",left:-1*$(e).position().left+100*t+"px"})})},t.prototype.add=function(t){return 0===t.li.closest("ul.cards").length?t.event("ready").take(1).subscribe(function(e){return function(){return t.li.children().addClass("adding"),h(1)(function(){return e.element.append(t.li),h(1)(function(){return t.li.children().removeClass("adding"),e.event("ready").raise(t)})})}}(this)):this.event("ready").raise(t)},t.prototype.insert=function(t,e){var n;return n=t.li,n.addClass("adding"),0===e?this.element.find("li.card").eq(0).before(n):this.element.find("li.card").eq(e-1).after(n),t.event("ready").take(1).subscribe(function(e){return function(){return h(1)(function(){var r;return r=Math.min(window.innerWidth,n.children("article").outerWidth(!0)),n.css("width",r),h(1)(function(){return n.removeClass("adding"),e.event("ready").raise(t)})})}}(this))},t.prototype.replace=function(t,e){return e.event("ready").take(1).subscribe(function(n){return function(){return t.li.removeClass("zoomed").after(e.li),e.li.removeClass("zoomed"),h(n.duration)(function(){return $("body").animate({scrollLeft:$("body").width()},1e3,function(){return t.li.remove(),e.li.addClass("zoomed"),h(350)(function(){return n.event("ready").raise(e)})})})}}(this))},t.prototype.remove=function(t){var e;return e=t.li,e.children().addClass("removing"),h(this.duration)(function(n){return function(){return e.addClass("removing"),h(1)(function(){return e.remove().removeClass("removing"),e.children().removeClass("removing"),n.event("removed").raise(t)})}}(this))},t}(),d=function(){function t(t,e,n,r){var i;this.cardListView=t,this.offset=null!=r?r:64,this.element=$(e),this.controls=$(n),this.state=new f.ObservableObject({index:{type:Number,defaultValue:0,remember:1,repeat:!0}}),this.state.event("index").subscribe(function(t){return function(e){return t.scrollTo(e)}}(this)),this.state.event("index").subscribe(function(t){return function(e){var n,r;return null!=(n=t.cardListView.cards.get(e))&&"function"==typeof n.event&&null!=(r=n.event("current"))?r.raise():void 0}}(this)),f.conjoin(this.cardListView.element.event("mousedown","li.card"),this.cardListView.element.event("mouseup","li.card")).map(function(t,e){return{target:$(t.target),deltaX:e.screenX-t.screenX,deltaY:e.screenY-t.screenY}}).where(Function.and(function(t){var e;return e=t.target,0===e.closest("a").length},function(t){var e;return e=t.deltaX,e>-3&&3>e},function(t){var e;return e=t.deltaY,e>-3&&3>e})).subscribe(function(t){return function(e){var n,r;return n=e.target,r=n.closest("li.card").index("li.card"),r!==t.state.index()?t.state.index(n.closest("li.card").index("li.card")):void 0}}(this)),i=$(document).event("keydown").where(function(t){var e;return e=t.target,0===$(e).closest("input,select,textarea,[contentEditable=true]").length}),f.disjoin(i.where(f.key(":left")).map(function(){return-1}),i.where(f.key(":right")).map(function(){return 1})).subscribe(function(t){return function(e){return t.state.index(Math.max(0,Math.min(t.cardListView.cards.count()-1,t.state.index()+e))),!1}}(this)),f.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(t){return function(){return t.controls.toggleClass("hidden",1===t.cardListView.cards.count())}}(this)),this.cardListView.event("removed").subscribe(function(t){return function(){return t.state.index(Math.min(t.cardListView.cards.count()-1,t.state.index()+1))}}(this)),this.controls.find("button.zoom").event("click").subscribe(function(t){return function(e){return t.zoom(e)}}(this)),this.cardListView.element.event("click","li.card").subscribe(function(t){return function(e){return t.unzoom(e)}}(this)),this.controls.find("button.close").event("click").subscribe(function(t){return function(){return t.cardListView.cards.remove(function(t){return t.li.index("li.card")>0})}}(this)),f.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(t){return function(){var e;return e=t.cardListView.cards.count(),t.controls.find(".count").text(e+" card"+(1!==e?"s":""))}}(this)),f.disjoin(this.cardListView.event("ready"),this.state.event("index")).map(function(t){return function(){return[t.state.index(),t.cardListView.cards.count()]}}(this)).subscribe(function(t){return function(e){var n,r;return r=e[0],n=e[1],t.controls.find(".previous").toggleClass("disabled",2>n||0===r),t.controls.find(".next").toggleClass("disabled",2>n||r===n-1)}}(this)),f.disjoin(this.controls.find(".previous").event("click").tag(-1),this.controls.find(".next").event("click").tag(1)).where($.target(function(){return!this.hasClass("disabled")})).subscribe(function(t){return function(e,n){return t.state.index(function(t){return t+n})}}(this)),this.controls.find(".list").closest("li").event("click","a").subscribe(function(t){return function(e){var n;return n=e.target,t.state.index($(n).data("index")),t.controls.find(".list").closest("li").children("div").fadeOut(),!1}}(this)),this.controls.find(".list").event("click").subscribe(function(t){return function(e){var n,r,i;return i=e.target,n=$(i).closest("li").children("div"),n.is(":visible")?n.fadeOut():(r=n.children("ul"),r.children().remove(),t.cardListView.cards.each(function(t,e){return r.append($("<li><a data-index='"+e+"' href='#'>"+t.title+"</a></li>"))}),n.fadeIn())}}(this))}return t.offsets=[],t.width=0,t.scrollLeft=0,t.prototype.scrollTo=function(t,e){var n;return null==e&&(e=300),n=this.cardListView.element.find("li.card").eq(t),n.length>0?this.element.stop().animate({scrollLeft:this.element.scrollLeft()+n.position().left+parseInt(n.css("margin-left"),10)+"px"},e):void 0},t.prototype.nudge=function(){var t;return t=this.element.scrollLeft(),this.element.animate({scrollLeft:parseInt(t,10)+200},500,function(e){return function(){return f.event.after(500).subscribe(function(){return e.element.animate({scrollLeft:t},500)})}}(this))},t.prototype.zoom=function(t){return this.element.addClass("zoomed"),this.offsets=[],this.width=0,this.cardListView.element.children("li").each(function(t){return function(e,n){return t.offsets.push($(n).position().left),t.width+=$(n).outerWidth(!0)}}(this)),h(1)(function(t){return function(){var e;return t.scrollLeft=t.element.scrollLeft(),e=t.element.outerWidth()/t.width,t.cardListView.element.css({position:"relative","-webkit-transform":"scale("+e+")",left:t.scrollLeft})}}(this))},t.prototype.unzoom=function(t){var e,n;return e=t.target,this.element.hasClass("zoomed")?(n=$(e).closest("ul.cards > li").index(),this.cardListView.element.css({"-webkit-transform":"none",left:this.scrollLeft-this.offsets[n]+"px"}),h(1)(function(t){return function(){return t.element.removeClass("zoomed")}}(this)),h(350)(function(t){return function(){return t.element.addClass("no_animation"),t.cardListView.element.css("left","0px"),t.element.scrollLeft(Math.min(t.offsets[n],t.width-t.element.width())),h(10)(function(){return t.element.removeClass("no_animation")})}}(this)),!1):void 0},t}(),c=function(){function t(t,e){var n;this.cardType=e,this.keys=function(){var e,r,i,s;for(i=t.match(/\{[^\}]+\}/g)||["id"],s=[],e=0,r=i.length;r>e;e++)n=i[e],s.push(n.replace("{","").replace("}","").replace("?",""));return s}(),this.pattern=new RegExp("^"+String(t).replace("/","/").replace(/\/?\{[^\}]+\?\}/g,"(?:/?([^/]+))?").replace(/\/?\{[^\}]+\}/g,"(?:/?([^/]+))")+"/?$")}return t.prototype.test=function(t){return this.pattern.test(t)},t.prototype.match=function(t){var e,r,i,s,o,a,u,c,l;for(c=this.pattern.exec(t),o=c[0],s=2<=c.length?n.call(c,1):[],i={},l=this.keys,e=a=0,u=l.length;u>a;e=++a)r=l[e],i[r]=null!=s?s[e]:void 0;return i},t}(),l=function(){function t(t){this.routes=t}return t.prototype.resolve=function(t){var e,n,r,i,s,o,a,u,c,l,d,h,f,v,p,m;if(f=t.split("#"),t=f[0],e=f[1],v=t.match(/([^\?]*)\??(.*)/),l=v[0],o=v[1],a=v[2],u=function(){var t,e,n,r;for(n=this.routes,r=[],t=0,e=n.length;e>t;t++)u=n[t],u.test(o)&&r.push(u);return r}.call(this)[0])for(n=u.match(o),s={fragment:e},p=function(){var t,e,n,r;for(n=a.split("&"),r=[],t=0,e=n.length;e>t;t++)i=n[t],r.push(i.split("="));return r}(),d=0,h=p.length;h>d;d++)m=p[d],r=m[0],c=m[1],s[r]=c;return[null!=u?u.cardType:void 0,n||{},s||{}]},t}(),o=function(){function e(t,e,n,r,i){this.cardList=t,this.view=e,this.viewport=n,this.element=r,this.router=i,$(document).event("click","a[href]").notBetween($(document).event("keydown").where(f.key(":leftcmd",":ctrl")),$(document).event("keyup").where(f.key(":leftcmd",":ctrl"))).subscribe(function(t){return function(e){return t.handle(e,!0)
}}(this)),$(document).event("click","a[href]").between($(document).event("keydown").where(f.key(":leftcmd",":ctrl")),$(document).event("keyup").where(f.key(":leftcmd",":ctrl"))).subscribe(function(t){return function(e){return t.handle(e,!1)}}(this))}return e.prototype.handle=function(e,n){var r,i,s,o,a,u,c,l,d,h,v,p,m,g,y,b,w,L,x,C;if(b=e.target,v=function(t){return window.open(t,Date().split(" ").join(""))},r=$(b).closest("a"),i=r.hasClass("before"),u=r.attr("href"),x=u.match(/([^#\?]*)((?:#)[^\?]*)?(\?.*)?/)||[],L=x[0],m=x[1],a=x[2],y=x[3],g=(u.match(/^([^:\?]*):.*/)||["https"])[0],d=r.closest("li.card"),c=new f.List,w="https://"+location.host+"/"+m,this.cardList.each(function(t,e){var n;return n=this.url.split("#")[0],c.add([e,n===w])}),h=c.first(function(t){var e,n;return n=t[0],e=t[1]}),null!=h)return this.viewport.state.index(h[0]),!1;if(o=0===d.length?$("li.card").length:d.index("li.card")+1,("http"===g||"https"===g)&&(C=this.router.resolve(m),s=C[0],l=C[1],p=C[2]),p=p||{},p.location={protocol:g,path:m,fragment:a,query:y},m===location.origin+location.pathname)return location.hash="#"+a,$(document).scrollTop(0),!1;if(r.attr("download"))return!0;if(r.hasClass("permalink"))return v(u),!1;if(null!=s){if(r.is(".disabled"))return!1;r.addClass("disabled"),t([s],function(t){return function(e){var s;return s=new e(t.cardList,l,void 0,p),s.url=u,s.li.hasClass("singleton")&&d.hasClass("singleton")&&1===t.cardList.count()?t.element.animate({scrollLeft:0},500,function(){return t.cardList.replace(t.cardList.get(0),s)}):t.cardList.insert(o+(i?-1:0),s),n?t.view.event("ready").where(function(t){return t===s}).subscribe(function(){return r.removeClass("disabled"),t.viewport.state.index(s.li.index("li.card"))}):void 0}}(this))}else"#"===u[0]&&"mailto"!==g?history.pushState(null,null,window.location.pathname+u):"mailto"!==g&&"javascript"!==g&&v(u);return"mailto"===g},e}(),i=function(){function e(e,n,r,i){var s,h;this.external=r,this.constructors=i,this.element=$(e),this.menuElement=$(n),this.events=new f.EventRegistry("initialised","ready"),this.event("initialised").remember(1),this.event("ready").remember(1),this.event("ready").subscribe(function(t){return function(){return t.element.removeClass("loading")}}(this)),this.cards=new a(this.external,this),this.router=new l(function(){var t,e;t=this.constructors,e=[];for(h in t)s=t[h],e.push(new c(h,s));return e}.call(this)),this.view=new u(this.cards,this.element),this.viewport=new d(this.view,this.element,this.menuElement,null!=this.external.offset),this.controller=new o(this.cards,this.view,this.viewport,this.element,this.router),this.element.children("li.card").each(function(e){return function(n,r){var i,o,a,u,c;return u=$(r).data("url"),c=e.router.resolve(u),i=c[0],o=c[1],a=c[2],t([i],function(t){return s=new t(e.cards,o,$(r),a),e.cards.add(s),e.viewport.state.index(e.cards.count()),e.cards.cards.count()===e.element.children("li.card").length?(e.cards.each(function(t){return t.event("ready").republish(e.event("ready"))}),e.event("initialised").raise()):void 0})}}(this))}return e.prototype.event=function(t){return this.events.get(t)},e}(),{Card:s,AjaxCard:r,List:a,ListView:u,ViewPort:d,Route:c,Router:l,Controller:o,Application:i}}),define("jview/drag",function(t){var $,e,n,i;return $=t("jquery"),i=t("jmodel/emerald"),t("jmodel-plugins/jquery.emerald"),e=function(){function t(t,e){this.element=$(t),this.extractors=new i.List.fromArray(e),this.element.find("*").attr("draggable",!1),this.element.attr("draggable",!0).event("dragstart").subscribe(function(t){return function(e){var n,r,i;return i=e.originalEvent,n=i.dataTransfer,r=e.target,n.dropEffect="none",t.extractors.each(function(t){var e,i,s;return s=t($(r)),i=s[0],e=s[1],n.setData(i,/json/.test(i)?JSON.stringify(e):e)})}}(this))}return t}(),n=function(){function t(t){var e,n;e=t.element,n=t.types,this.effect=t.effect,this.element=$(e),this.types=new i.List.fromArray(n),this.events=new i.EventRegistry("drop"),i.disjoin(this.element.event("dragenter",{preventDefault:!0}).where(function(t){return function(e){var n;return n=e.originalEvent.dataTransfer,t.accept(n)}}(this)).map(function(){return 1}),this.element.event("dragleave",{preventDefault:!0}).where(function(t){return function(e){var n;return n=e.originalEvent.dataTransfer,t.accept(n)}}(this)).map(function(){return-1}),this.element.event("drop",{preventDefault:!0}).map(function(){return 1})).accumulate(i.plus,0).subscribe(function(t){return function(e){return t.element.toggleClass("over",e>0)}}(this)),this.element.event("dragover",{preventDefault:!0}).map(function(t){var e;return e=t.originalEvent.dataTransfer}).where(function(t){return function(e){return t.accept(e)}}(this)).subscribe(function(t){return function(e){return e.dropEffect=t.effect,!1}}(this)),this.element.event("drop",{stopPropagation:!0}).map(function(t){var e;return e=t.originalEvent.dataTransfer}).subscribe(function(t){return function(e){return t.element.removeClass("over"),t.types.each(function(n){var r;return r=e.getData(n),""!==r?t.event("drop").raise(/json/.test(n)?JSON.parse(r):r,n):void 0}),!1}}(this))}return t.prototype.event=function(t){return this.events.get(t)},t.prototype.accept=function(t){return this.types.exists(function(e){return r.call(t.types,e)>=0})},t}(),{Source:e,Target:n}}),define("jview/hierarchy",function(t){var $,e,n,r;return $=t("jquery"),r=t("jmodel/topaz"),e=function(){function t(t){this.title=t.title,this.href=t.href,this.tail=t.tail}return t}(),n=function(){function t(t){this.element=$(t)}return t.prototype.renderNodes=function(t,e){return this.element.children("li").filter(function(t){return t>=e}).remove(),this.renderNode(t)},t.prototype.renderNode=function(t){return t&&(this.element.append($("<li/>").append($('<a class="singleton"/>').attr("href",t.href).text(t.title))),t.tail)?this.renderNode(t.tail):void 0},t}(),{Node:e,View:n}}),define("jview/palettes",function(t){var $,e,n;return $=t("jquery"),n=t("jmodel/topaz"),t("jmodel-plugins/jquery.emerald"),e=function(){function t(t,e,r){var i,s,o,a;this.parameters=e,this.constructors=r,this.dl=$(t),this.dt=this.dl.children("dt"),this.state=new n.ObservableObject({current:Number,open:Boolean(!1)},{repeat:!0}),this.palettes=function(){var t,e;t=this.constructors,e=[];for(i in t)s=t[i],o=this.dl.children("dd").filter(i),a=o.prev("dt"),e.push(new s(a,o,this));return e}.call(this),this.dt.event("click").map(function(t){return function(t){var e;return e=t.target,Math.floor($(e).index()/2)}}(this)).subscribe(function(t){return function(e){return t.state.current(e),t.state.open(function(t){return!t})}}(this)),this.state.event("open").subscribe(function(t){return function(e){return t.dt.each(function(n,r){return n!==t.state.current()?$(r).removeClass("open"):$(r).toggleClass("open",e)})}}(this))}return t}(),{Palettes:e}})}).call(this);