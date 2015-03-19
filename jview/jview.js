(function(){var __hasProp={}.hasOwnProperty,__extends=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)__hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child},__slice=[].slice,__indexOf=[].indexOf||function(item){for(var i=0,l=this.length;l>i;i++)if(i in this&&this[i]===item)return i;return-1};define("jview/cards",function(require){var $,AjaxCard,Application,Card,Controller,List,ListView,Route,Router,ViewPort,after,jm;return $=require("jquery"),jm=require("jmodel/topaz"),require("jmodel-plugins/jquery.emerald"),require("jmodel-plugins/emerald.keys"),after=function(period){return function(fn){return jm.event.after(period).subscribe(fn)}},$.target=function(fn){return function(_arg){var target;return target=_arg.target,fn.call($(target))}},Card=function(){function Card(){this.events=new jm.EventRegistry("ready","dispose","current"),this.event("ready").remember(1),this.li=$(this.li?this.li:'<li class="card"/>'),this.li.addClass(this["class"]),this.li.event("click",".close").subscribe(function(_this){return function(){return _this.event("dispose").raise(_this),!1}}(this))}return Card.prototype.event=function(name){return this.events.get(name)},Card}(),AjaxCard=function(_super){function AjaxCard(){AjaxCard.__super__.constructor.call(this),this.events.add("load",jm.event.fromAjax(this.load)),this.event("load").subscribe(function(_this){return function(html){return _this.init(html)}}(this))}return __extends(AjaxCard,_super),AjaxCard.prototype["class"]="",AjaxCard.prototype.load=null,AjaxCard.prototype.get=function(params){return this.event("load").start(params)},AjaxCard.prototype.init=function(html){return this.li.html(html),this.li.toggleClass("error",$(html).hasClass("error")),this.url=this.li.children("article").data("url"),this.event("ready").raise(this)},AjaxCard}(Card),List=function(){function List(external,application){this.external=external,this.application=application,this.cards=new jm.ObservableTypedList(Card),this.events=new jm.EventRegistry("add","insert","replace","remove","count","ready"),this.event("ready").remember(1),this.cards.events.republish({add:this.event("add"),insert:this.event("insert"),replace:this.event("replace"),remove:this.event("remove")}),jm.disjoin(this.cards.event("add"),this.cards.event("insert"),this.cards.event("replace").map(function(_,card){return card})).subscribe(function(_this){return function(card){return card.event("ready").subscribe(function(card){return _this.event("ready").raise(card)}),card.event("dispose").subscribe(function(card){return _this.cards.remove(card)})}}(this))}return List.prototype.event=function(name){return this.events.get(name)},List.prototype.add=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).add.apply(_ref,args)},List.prototype.insert=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).insert.apply(_ref,args)},List.prototype.replace=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).replace.apply(_ref,args)},List.prototype.remove=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).remove.apply(_ref,args)},List.prototype.get=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).get.apply(_ref,args)},List.prototype.count=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).count.apply(_ref,args)},List.prototype.first=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).first.apply(_ref,args)},List.prototype.each=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).each.apply(_ref,args)},List.prototype.map=function(){var args,_ref;return args=1<=arguments.length?__slice.call(arguments,0):[],(_ref=this.cards).map.apply(_ref,args)},List}(),ListView=function(){function ListView(cards,element,duration){this.cards=cards,this.duration=null!=duration?duration:750,this.element=$(element),this.events=new jm.EventRegistry("ready","removed"),this.cards.events.subscribe({add:function(_this){return function(){var args;return args=1<=arguments.length?__slice.call(arguments,0):[],_this.add.apply(_this,args)}}(this),insert:function(_this){return function(){var args;return args=1<=arguments.length?__slice.call(arguments,0):[],_this.insert.apply(_this,args)}}(this),replace:function(_this){return function(){var args;return args=1<=arguments.length?__slice.call(arguments,0):[],_this.replace.apply(_this,args)}}(this),remove:function(_this){return function(){var args;return args=1<=arguments.length?__slice.call(arguments,0):[],_this.remove.apply(_this,args)}}(this)})}return ListView.prototype.event=function(name){return this.events.get(name)},ListView.prototype.fold=function(){return this.element.find("li.card").each(function(index,li){return $(li).css({"-webkit-transform":"rotate("+(4*(index%2)-2)+"deg)",left:-1*$(li).position().left+100*index+"px"})})},ListView.prototype.add=function(card){return 0===card.li.closest("ul.cards").length?card.event("ready").take(1).subscribe(function(_this){return function(){return card.li.children().addClass("adding"),after(1)(function(){return _this.element.append(card.li),after(1)(function(){return card.li.children().removeClass("adding"),_this.event("ready").raise(card)})})}}(this)):this.event("ready").raise(card)},ListView.prototype.insert=function(card,index){var li;return li=card.li,li.addClass("adding"),0===index&&this.element.find("li.card").length>0?this.element.find("li.card").eq(0).before(li):0===index?this.element.append(card.li):this.element.find("li.card").eq(index-1).after(li),card.event("ready").take(1).subscribe(function(_this){return function(){return after(1)(function(){var width;return width=Math.min(window.innerWidth,li.children("article").outerWidth(!0)),li.css("width",width),after(1)(function(){return li.removeClass("adding"),_this.event("ready").raise(card)})})}}(this))},ListView.prototype.replace=function(before,card){return card.event("ready").take(1).subscribe(function(_this){return function(){return before.li.removeClass("zoomed").after(card.li),card.li.removeClass("zoomed"),after(_this.duration)(function(){return $("body").animate({scrollLeft:$("body").width()},1e3,function(){return before.li.remove(),card.li.addClass("zoomed"),after(350)(function(){return _this.event("ready").raise(card)})})})}}(this))},ListView.prototype.remove=function(card){var li;return li=card.li,li.children().addClass("removing"),after(this.duration)(function(_this){return function(){return li.addClass("removing"),after(1)(function(){return li.remove().removeClass("removing"),li.children().removeClass("removing"),_this.event("removed").raise(card)})}}(this))},ListView}(),ViewPort=function(){function ViewPort(cardListView,element,controls,offset){var keyEvent;this.cardListView=cardListView,this.offset=null!=offset?offset:64,this.element=$(element),this.controls=$(controls),this.state=new jm.ObservableObject({index:{type:Number,defaultValue:0,remember:1,repeat:!0}}),this.state.event("index").subscribe(function(_this){return function(index){return _this.scrollTo(index)}}(this)),this.state.event("index").subscribe(function(_this){return function(index){var _ref,_ref1;return null!=(_ref=_this.cardListView.cards.get(index))&&"function"==typeof _ref.event&&null!=(_ref1=_ref.event("current"))?_ref1.raise():void 0}}(this)),jm.conjoin(this.cardListView.element.event("mousedown","li.card"),this.cardListView.element.event("mouseup","li.card")).map(function(down,up){return{target:$(down.target),deltaX:up.screenX-down.screenX,deltaY:up.screenY-down.screenY}}).where(Function.and(function(_arg){var target;return target=_arg.target,0===target.closest("a").length},function(_arg){var deltaX;return deltaX=_arg.deltaX,deltaX>-3&&3>deltaX},function(_arg){var deltaY;return deltaY=_arg.deltaY,deltaY>-3&&3>deltaY})).subscribe(function(_this){return function(_arg){var target,targetIndex;return target=_arg.target,targetIndex=target.closest("li.card").index("li.card"),targetIndex!==_this.state.index()?_this.state.index(target.closest("li.card").index("li.card")):void 0}}(this)),keyEvent=$(document).event("keydown").where(function(_arg){var target;return target=_arg.target,0===$(target).closest("input,select,textarea,[contentEditable=true]").length}),jm.disjoin(keyEvent.where(jm.key(":left")).map(function(){return-1}),keyEvent.where(jm.key(":right")).map(function(){return 1})).subscribe(function(_this){return function(step){return _this.state.index(Math.max(0,Math.min(_this.cardListView.cards.count()-1,_this.state.index()+step))),!1}}(this)),jm.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(_this){return function(){return _this.controls.toggleClass("hidden",1===_this.cardListView.cards.count())}}(this)),this.cardListView.event("removed").subscribe(function(_this){return function(){return _this.state.index(Math.min(_this.cardListView.cards.count()-1,_this.state.index()+1))}}(this)),this.controls.find("button.zoom").event("click").subscribe(function(_this){return function(event){return _this.zoom(event)}}(this)),this.cardListView.element.event("click","li.card").subscribe(function(_this){return function(event){return _this.unzoom(event)}}(this)),this.controls.find("button.close").event("click").subscribe(function(_this){return function(){return _this.cardListView.cards.remove(function(card){return card.li.index("li.card")>0})}}(this)),jm.disjoin(this.cardListView.event("ready"),this.cardListView.event("removed")).subscribe(function(_this){return function(){var count;return count=_this.cardListView.cards.count(),_this.controls.find(".count").text(count+" card"+(1!==count?"s":""))}}(this)),jm.disjoin(this.cardListView.event("ready"),this.state.event("index")).map(function(_this){return function(){return[_this.state.index(),_this.cardListView.cards.count()]}}(this)).subscribe(function(_this){return function(_arg){var count,index;return index=_arg[0],count=_arg[1],_this.controls.find(".previous").toggleClass("disabled",2>count||0===index),_this.controls.find(".next").toggleClass("disabled",2>count||index===count-1)}}(this)),jm.disjoin(this.controls.find(".previous").event("click").tag(-1),this.controls.find(".next").event("click").tag(1)).where($.target(function(){return!this.hasClass("disabled")})).subscribe(function(_this){return function(event,step){return _this.state.index(function(value){return value+step})}}(this)),this.controls.find(".list").closest("li").event("click","a").subscribe(function(_this){return function(_arg){var target;return target=_arg.target,_this.state.index($(target).data("index")),_this.controls.find(".list").closest("li").children("div").fadeOut(),!1}}(this)),this.controls.find(".list").event("click").subscribe(function(_this){return function(_arg){var div,list,target;return target=_arg.target,div=$(target).closest("li").children("div"),div.is(":visible")?div.fadeOut():(list=div.children("ul"),list.children().remove(),_this.cardListView.cards.each(function(card,index){return list.append($("<li><a data-index='"+index+"' href='#'>"+card.title+"</a></li>"))}),div.fadeIn())}}(this))}return ViewPort.offsets=[],ViewPort.width=0,ViewPort.scrollLeft=0,ViewPort.prototype.scrollTo=function(index,duration){var li;return null==duration&&(duration=300),li=this.cardListView.element.find("li.card").eq(index),li.length>0?this.element.stop().animate({scrollLeft:this.element.scrollLeft()+li.position().left+parseInt(li.css("margin-left"),10)+"px"},duration):void 0},ViewPort.prototype.nudge=function(){var scrollLeft;return scrollLeft=this.element.scrollLeft(),this.element.animate({scrollLeft:parseInt(scrollLeft,10)+200},500,function(_this){return function(){return jm.event.after(500).subscribe(function(){return _this.element.animate({scrollLeft:scrollLeft},500)})}}(this))},ViewPort.prototype.zoom=function(event){return this.element.addClass("zoomed"),this.offsets=[],this.width=0,this.cardListView.element.children("li").each(function(_this){return function(index,item){return _this.offsets.push($(item).position().left),_this.width+=$(item).outerWidth(!0)}}(this)),after(1)(function(_this){return function(){var scale;return _this.scrollLeft=_this.element.scrollLeft(),scale=_this.element.outerWidth()/_this.width,_this.cardListView.element.css({position:"relative","-webkit-transform":"scale("+scale+")",left:_this.scrollLeft})}}(this))},ViewPort.prototype.unzoom=function(_arg){var target,targetIndex;return target=_arg.target,this.element.hasClass("zoomed")?(targetIndex=$(target).closest("ul.cards > li").index(),this.cardListView.element.css({"-webkit-transform":"none",left:this.scrollLeft-this.offsets[targetIndex]+"px"}),after(1)(function(_this){return function(){return _this.element.removeClass("zoomed")}}(this)),after(350)(function(_this){return function(){return _this.element.addClass("no_animation"),_this.cardListView.element.css("left","0px"),_this.element.scrollLeft(Math.min(_this.offsets[targetIndex],_this.width-_this.element.width())),after(10)(function(){return _this.element.removeClass("no_animation")})}}(this)),!1):void 0},ViewPort}(),Route=function(){function Route(pattern,cardType){var key;this.cardType=cardType,this.keys=function(){var _i,_len,_ref,_results;for(_ref=pattern.match(/\{[^\}]+\}/g)||["id"],_results=[],_i=0,_len=_ref.length;_len>_i;_i++)key=_ref[_i],_results.push(key.replace("{","").replace("}","").replace("?",""));return _results}(),this.pattern=new RegExp("^"+String(pattern).replace("/","/").replace(/\/?\{[^\}]+\?\}/g,"(?:/?([^/]+))?").replace(/\/?\{[^\}]+\}/g,"(?:/?([^/]+))")+"/?$")}return Route.prototype.test=function(path){return this.pattern.test(path)},Route.prototype.match=function(path){var index,key,keys,values,_,_i,_len,_ref,_ref1;for(_ref=this.pattern.exec(path),_=_ref[0],values=2<=_ref.length?__slice.call(_ref,1):[],keys={},_ref1=this.keys,index=_i=0,_len=_ref1.length;_len>_i;index=++_i)key=_ref1[index],keys[key]=null!=values?values[index]:void 0;return keys},Route}(),Router=function(){function Router(routes){this.routes=routes}return Router.prototype.resolve=function(url){var fragment,keys,name,param,parameters,path,query,route,value,_,_i,_len,_ref,_ref1,_ref2,_ref3;if(_ref=url.split("#"),url=_ref[0],fragment=_ref[1],_ref1=url.match(/([^\?]*)\??(.*)/),_=_ref1[0],path=_ref1[1],query=_ref1[2],route=function(){var _i,_len,_ref2,_results;for(_ref2=this.routes,_results=[],_i=0,_len=_ref2.length;_len>_i;_i++)route=_ref2[_i],route.test(path)&&_results.push(route);return _results}.call(this)[0])for(keys=route.match(path),parameters={fragment:fragment},_ref2=function(){var _j,_len,_ref2,_results;for(_ref2=query.split("&"),_results=[],_j=0,_len=_ref2.length;_len>_j;_j++)param=_ref2[_j],_results.push(param.split("="));return _results}(),_i=0,_len=_ref2.length;_len>_i;_i++)_ref3=_ref2[_i],name=_ref3[0],value=_ref3[1],parameters[name]=value;return[null!=route?route.cardType:void 0,keys||{},parameters||{}]},Router}(),Controller=function(){function Controller(cardList,view,viewport,element,router){this.cardList=cardList,this.view=view,this.viewport=viewport,this.element=element,this.router=router,$(document).event("click","a[href]").notBetween($(document).event("keydown").where(jm.key(":leftcmd",":ctrl")),$(document).event("keyup").where(jm.key(":leftcmd",":ctrl"))).subscribe(function(_this){return function(event){return _this.handle(event,!0)}}(this)),$(document).event("click","a[href]").between($(document).event("keydown").where(jm.key(":leftcmd",":ctrl")),$(document).event("keyup").where(jm.key(":leftcmd",":ctrl"))).subscribe(function(_this){return function(event){return _this.handle(event,!1)}}(this))}return Controller.prototype.handle=function(_arg,animate){var a,before,cardType,currentIndex,fragment,href,indexes,keys,li,matched,open,parameters,path,protocol,query,target,url,_,_ref,_ref1;if(target=_arg.target,open=function(href){return window.open(href,Date().split(" ").join(""))},a=$(target).closest("a"),before=a.hasClass("before"),href=a.attr("href"),_ref=href.match(/([^#\?]*)((?:#)[^\?]*)?(\?.*)?/)||[],_=_ref[0],path=_ref[1],fragment=_ref[2],query=_ref[3],protocol=(href.match(/^([^:\?]*):.*/)||["https"])[0],li=a.closest("li.card"),indexes=new jm.List,url="https://"+location.host+"/"+path,this.cardList.each(function(card,index){var current;return current=this.url.split("#")[0],indexes.add([index,current===url])}),matched=indexes.first(function(_arg1){var match,_;return _=_arg1[0],match=_arg1[1]}),null!=matched)return this.viewport.state.index(matched[0]),!1;if(currentIndex=0===li.length?$("li.card").length:li.index("li.card")+1,("http"===protocol||"https"===protocol)&&(_ref1=this.router.resolve(path),cardType=_ref1[0],keys=_ref1[1],parameters=_ref1[2]),parameters=parameters||{},parameters.location={protocol:protocol,path:path,fragment:fragment,query:query},path===location.origin+location.pathname)return location.hash="#"+fragment,$(document).scrollTop(0),!1;if(a.attr("download"))return!0;if(a.hasClass("permalink"))return open(href),!1;if(null!=cardType){if(a.is(".disabled"))return!1;a.addClass("disabled"),require([cardType],function(_this){return function(cardType){var card;return card=new cardType(_this.cardList,keys,void 0,parameters),card.url=href,card.li.hasClass("singleton")&&li.hasClass("singleton")&&1===_this.cardList.count()?_this.element.animate({scrollLeft:0},500,function(){return _this.cardList.replace(_this.cardList.get(0),card)}):_this.cardList.insert((currentIndex||0)+(before?-1:0),card),animate?_this.view.event("ready").where(function(inserted){return inserted===card}).subscribe(function(){return a.removeClass("disabled"),_this.viewport.state.index(card.li.index("li.card"))}):void 0}}(this))}else"#"===href[0]&&"mailto"!==protocol?history.pushState(null,null,window.location.pathname+href):"mailto"!==protocol&&"javascript"!==protocol&&open(href);return"mailto"===protocol},Controller}(),Application=function(){function Application(element,menuElement,external,constructors){var card,route;this.external=external,this.constructors=constructors,this.element=$(element),this.menuElement=$(menuElement),this.events=new jm.EventRegistry("initialised","ready"),this.event("initialised").remember(1),this.event("ready").remember(1),this.event("ready").subscribe(function(_this){return function(){return _this.element.removeClass("loading")}}(this)),this.cards=new List(this.external,this),this.router=new Router(function(){var _ref,_results;_ref=this.constructors,_results=[];for(route in _ref)card=_ref[route],_results.push(new Route(route,card));return _results}.call(this)),this.view=new ListView(this.cards,this.element),this.viewport=new ViewPort(this.view,this.element,this.menuElement,null!=this.external.offset),this.controller=new Controller(this.cards,this.view,this.viewport,this.element,this.router),this.element.children("li.card").each(function(_this){return function(index,li){var cardType,keys,parameters,url,_ref;return url=$(li).data("url"),_ref=_this.router.resolve(url),cardType=_ref[0],keys=_ref[1],parameters=_ref[2],require([cardType],function(cardType){return card=new cardType(_this.cards,keys,$(li),parameters),_this.cards.add(card),_this.viewport.state.index(_this.cards.count()),_this.cards.cards.count()===_this.element.children("li.card").length?(_this.cards.each(function(card){return card.event("ready").republish(_this.event("ready"))}),_this.event("initialised").raise()):void 0})}}(this))}return Application.prototype.event=function(name){return this.events.get(name)},Application}(),{Card:Card,AjaxCard:AjaxCard,List:List,ListView:ListView,ViewPort:ViewPort,Route:Route,Router:Router,Controller:Controller,Application:Application}}),define("jview/drag",function(require){var $,Source,Target,jm;return $=require("jquery"),jm=require("jmodel/emerald"),require("jmodel-plugins/jquery.emerald"),Source=function(){function Source(element,extractors){this.element=$(element),this.extractors=new jm.List.fromArray(extractors),this.element.find("*").attr("draggable",!1),this.element.attr("draggable",!0).event("dragstart").subscribe(function(_this){return function(_arg){var dataTransfer,target,_ref;return _ref=_arg.originalEvent,dataTransfer=_ref.dataTransfer,target=_arg.target,dataTransfer.dropEffect="none",_this.extractors.each(function(extractor){var data,type,_ref1;return _ref1=extractor($(target)),type=_ref1[0],data=_ref1[1],dataTransfer.setData(type,/json/.test(type)?JSON.stringify(data):data)})}}(this))}return Source}(),Target=function(){function Target(_arg){var element,types;element=_arg.element,types=_arg.types,this.effect=_arg.effect,this.element=$(element),this.types=new jm.List.fromArray(types),this.events=new jm.EventRegistry("drop"),jm.disjoin(this.element.event("dragenter",{preventDefault:!0}).where(function(_this){return function(_arg1){var dataTransfer;return dataTransfer=_arg1.originalEvent.dataTransfer,_this.accept(dataTransfer)}}(this)).map(function(){return 1}),this.element.event("dragleave",{preventDefault:!0}).where(function(_this){return function(_arg1){var dataTransfer;return dataTransfer=_arg1.originalEvent.dataTransfer,_this.accept(dataTransfer)}}(this)).map(function(){return-1}),this.element.event("drop",{preventDefault:!0}).map(function(){return 1})).accumulate(jm.plus,0).subscribe(function(_this){return function(count){return _this.element.toggleClass("over",count>0)}}(this)),this.element.event("dragover",{preventDefault:!0}).map(function(_arg1){var dataTransfer;return dataTransfer=_arg1.originalEvent.dataTransfer}).where(function(_this){return function(transfer){return _this.accept(transfer)}}(this)).subscribe(function(_this){return function(transfer){return transfer.dropEffect=_this.effect,!1}}(this)),this.element.event("drop",{stopPropagation:!0}).map(function(_arg1){var dataTransfer;return dataTransfer=_arg1.originalEvent.dataTransfer}).subscribe(function(_this){return function(transfer){return _this.element.removeClass("over"),_this.types.each(function(type){var datum;return datum=transfer.getData(type),""!==datum?_this.event("drop").raise(/json/.test(type)?JSON.parse(datum):datum,type):void 0}),!1}}(this))}return Target.prototype.event=function(name){return this.events.get(name)},Target.prototype.accept=function(transfer){return this.types.exists(function(type){return __indexOf.call(transfer.types,type)>=0})},Target}(),{Source:Source,Target:Target}}),define("jview/hierarchy",function(require){var $,Node,View,jm;return $=require("jquery"),jm=require("jmodel/topaz"),Node=function(){function Node(_arg){this.title=_arg.title,this.href=_arg.href,this.tail=_arg.tail}return Node}(),View=function(){function View(element){this.element=$(element)}return View.prototype.renderNodes=function(node,preserve){return this.element.children("li").filter(function(index){return index>=preserve}).remove(),this.renderNode(node)},View.prototype.renderNode=function(node){return node&&(this.element.append($("<li/>").append($('<a class="singleton"/>').attr("href",node.href).text(node.title))),node.tail)?this.renderNode(node.tail):void 0},View}(),{Node:Node,View:View}}),define("jview/palettes",function(require){var $,Palettes,jm;return $=require("jquery"),jm=require("jmodel/topaz"),require("jmodel-plugins/jquery.emerald"),Palettes=function(){function Palettes(dl,parameters,constructors){var className,constructor,dd,dt;this.parameters=parameters,this.constructors=constructors,this.dl=$(dl),this.dt=this.dl.children("dt"),this.state=new jm.ObservableObject({current:Number,open:Boolean(!1)},{repeat:!0}),this.palettes=function(){var _ref,_results;_ref=this.constructors,_results=[];for(className in _ref)constructor=_ref[className],dd=this.dl.children("dd").filter(className),dt=dd.prev("dt"),_results.push(new constructor(dt,dd,this));return _results}.call(this),this.dt.event("click").map(function(_this){return function(_arg){var target;return target=_arg.target,Math.floor($(target).index()/2)}}(this)).subscribe(function(_this){return function(index){return _this.state.current(index),_this.state.open(function(x){return!x})}}(this)),this.state.event("open").subscribe(function(_this){return function(open){return _this.dt.each(function(index,element){return index!==_this.state.current()?$(element).removeClass("open"):$(element).toggleClass("open",open)})}}(this))}return Palettes}(),{Palettes:Palettes}})}).call(this);