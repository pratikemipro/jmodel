define 'jview/cards', (require) ->
	
	$	= require 'jquery'
	jm	= require 'jmodel/topaz'
	
	require 'jmodel-plugins/jquery.emerald'
	require 'jmodel-plugins/emerald.keys'

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn
	
	$.target = (fn) -> ({target}) -> fn.call $ target


	##
	## Card
	##	
	
	class Card
		
		constructor: ->
			
			@li = $ '<li class="card"/>'
			@li.addClass @class
		
			@events = new jm.EventRegistry 'ready', 'dispose', 'current'
			@event('ready').remember 1
			
			@li.event('click','.close').subscribe =>
				@event('dispose').raise this
				false
				
		event: (name) -> @events.get name
		
		handle: (url) ->
			matched = url == @url?.split('#')[0]
			if matched then @event('current').raise this
			return matched
	
	
	##
	## AjaxCard
	##
	
	class AjaxCard extends Card
		
		class: ''
		load: null
	
		constructor: ->
			
			super()
			
			@events.add 'load', jm.event.fromAjax @load
			
			@event('load').subscribe (html) => @init html
		
		get: (params) ->
			@event('load').start params
			
		init: (html) ->
			@li.html html
			@li.toggleClass 'error', $(html).hasClass('error')
			@url = @li.children('article').data 'url'
			@event('ready').raise this
	

	##
	## List
	##

	class CardList
	
		constructor: ({types,@external,@application}) ->
			
			@cards  = new jm.ObservableTypedList(Card)
			@events = new jm.EventRegistry 'add', 'insert', 'replace', 'remove', 'count', 'ready', 'current'
			@event('ready').remember 1
			
			@router = new Router ( new Route(card.match,card) for card in types )
			
			@cards.events.republish
				add:     @event 'add'
				insert:  @event 'insert'
				replace: @event 'replace'
				remove:  @event 'remove'
			
			jm.disjoin(
				@cards.event('add'),
				@cards.event('insert'),
				@cards.event('replace').map( (_,card) -> card )
			)
			.subscribe (card) =>
				card.event('current').republish @event 'current'
				card.event('ready').subscribe   (card) => @event('ready').raise card
				card.event('dispose').subscribe (card) => @cards.remove card
		
		event: (name) -> @events.get name
		
		handle: (url,index) ->
			
			## Let existing cards try to handle URL
			handled = @cards
				.map -> @handle url
				.first()
				
			## Let router try to handle URL
			[_,path,fragment,query] = url.replace(location.protocol+'//'+location.host+'/','').match( /([^#\?]*)((?:#)[^\?]*)?(\?.*)?/ ) or []
			[protocol] = url.match( /^([^:\?]*):.*/ ) or ['https']
			[cardType,keys,parameters] = @router.resolve path
			
			if cardType
				@insert index, new cardType this, keys, parameters
			
			return handled or cardType?
		
		# Delegation
		add:     (args...) -> @cards.add args...
		insert:  (args...) -> @cards.insert args...
		replace: (args...) -> @cards.replace args...
		remove:  (args...) -> @cards.remove args...
		get:	 (args...) -> @cards.get args...
		count:	 (args...) -> @cards.count args...
		first:	 (args...) -> @cards.first args...
		each:    (args...) -> @cards.each args...
		map:	 (args...) -> @cards.map args...
		
			
	##
	## ListView
	##
	
	class ListView
		
		constructor: (@cards,element,@duration=750) ->
			
			@element  = $ element
			@events   = new jm.EventRegistry 'ready', 'removed'
			
			@cards.events.subscribe
				add:     (args...) => @add args...
				insert:  (args...) => @insert args...
				replace: (args...) => @replace args...
				remove:  (args...) => @remove args...
		
		event: (name) -> @events.get name
		
		fold: ->
			@element.find('li.card').each (index,li) ->
				$(li).css
					'-webkit-transform': 'rotate('+(4*(index % 2) - 2)+'deg)'
					'left': (-1*$(li).position().left+100*index)+'px'
		
		## Adding a card to end of list
		add: (card) ->
			if card.li.closest('ul.cards').length == 0
				card.event('ready').take(1).subscribe =>
					card.li.children().addClass 'adding'
					after(1) =>
						@element.append card.li
						after(1) =>
							card.li.children().removeClass 'adding'
							@event('ready').raise card
			else
				@event('ready').raise card
					
		## Inserting a card at specfic index
		insert: (card,index) ->
			li = card.li
			li.addClass 'adding'
			if index == 0 and @element.find('li.card').length > 0
				@element.find('li.card').eq(0).before li
			else if index == 0
				@element.append card.li
			else
				@element.find('li.card').eq(index-1).after li
			card.event('ready').take(1).subscribe =>
				after(1) =>
					width = Math.min window.innerWidth, li.children('article').outerWidth(true)
					li.css 'width', width
					after(1) =>
						li.removeClass 'adding'
						@event('ready').raise card
			
		replace: (before,card) ->
			card.event('ready').take(1).subscribe =>
				before.li
					.removeClass('zoomed')
					.after(card.li)
				card.li.removeClass 'zoomed'
				after(@duration) =>
					$('body').animate { scrollLeft: $('body').width() }, 1000, () =>
						before.li.remove()
						card.li.addClass 'zoomed'
						after(350) => @event('ready').raise card
			
		remove: (card) ->
			li = card.li
			li.children().addClass 'removing'
			after(@duration) =>
				li.addClass 'removing'
				after(1) =>
					li.remove().removeClass 'removing'
					li.children().removeClass 'removing'
					@event('removed').raise card
	

	##
	## ViewPort
	##
	
	class ViewPort
		
		@offsets: []
		@width: 0
		@scrollLeft: 0
		
		constructor: (@cardListView,element,controls,@offset=64) ->
			
			@element  = $ element
			@controls = $ controls
			@state = new jm.ObservableObject
				index:
					type: Number
					defaultValue: 0
					remember: 1
					repeat: true
			
			# Changing state scrolls to card
			@state.event('index').subscribe (index) => @scrollTo index
			
			# Inform cards that they are current
			# @state.event('index').subscribe (index) =>
# 				@cardListView.cards.get(index)?.event?('current')?.raise()

			# Scroll to current card
			jm.disjoin(
				@cardListView.cards.event 'current'
				@cardListView.cards.event 'ready'
			)
			.subscribe (card) =>
				@state.index card.li.index 'li.card'
			
			# Clicking on a card makes it the current card
			jm.conjoin(
				@cardListView.element.event('mousedown','li.card'),
				@cardListView.element.event('mouseup','li.card')
			)
			.map( (down,up) ->
				target: $(down.target)
				deltaX: up.screenX - down.screenX
				deltaY: up.screenY - down.screenY
			)
			.where( Function.and \
				({target}) -> target.closest('a').length == 0,
				({deltaX}) -> -3 < deltaX < 3,
				({deltaY}) -> -3 < deltaY < 3
			)
			.subscribe ({target}) =>
				targetIndex = target.closest('li.card').index('li.card')
				if targetIndex != @state.index()
					@state.index target.closest('li.card').index('li.card')

			# Keyboard control
			keyEvent = $(document).event('keydown').where ({target}) -> $(target).closest('input,select,textarea,[contentEditable=true]').length == 0
			
			jm.disjoin(
				keyEvent.where(jm.key(':left')).map(->-1)
				keyEvent.where(jm.key(':right')).map(->1)
			)
			.subscribe (step) =>
				@state.index Math.max(0,Math.min(@cardListView.cards.count()-1,@state.index()+step))
				return false
				
			# ViewPort controls
			jm.disjoin(
				@cardListView.event('ready'),
				@cardListView.event('removed')
			)
			.subscribe => @controls.toggleClass 'hidden', @cardListView.cards.count() == 1
			
			# Change current card on removal
			@cardListView.event('removed').subscribe =>
				@state.index Math.min @cardListView.cards.count()-1, @state.index()+1
			
			# Zoom
			@controls.find('button.zoom').event('click').subscribe (event) => @zoom event
			
			# Unzoom
			@cardListView.element.event('click','li.card').subscribe (event) => @unzoom event
			
			# Clear
			@controls.find('button.close').event('click').subscribe => 
				@cardListView.cards.remove (card) -> card.li.index('li.card') > 0
			
			# Count
			jm.disjoin(
				@cardListView.event('ready'),
				@cardListView.event('removed')
			)
			.subscribe =>
				count = @cardListView.cards.count()
				@controls.find('.count').text( count + ' card' + if count != 1 then 's' else '' )
				
			# Back/forward visiblity
			jm.disjoin(
				@cardListView.event('ready'),
				@state.event('index')
			)
			.map(=> [ @state.index(), @cardListView.cards.count() ] )
			.subscribe ([index,count]) =>
				@controls.find('.previous').toggleClass 'disabled', count < 2 or index == 0
				@controls.find('.next').toggleClass 'disabled', count < 2 or index == count - 1
				
			# Back
			jm.disjoin(
				@controls.find('.previous').event('click').tag(-1)
				@controls.find('.next').event('click').tag(1)
			)
			.where( $.target -> not @hasClass 'disabled' )
			.subscribe (event,step) => @state.index (value) -> value + step
			
			# List item
			@controls.find('.list').closest('li').event('click','a')
				.subscribe ({target}) =>
					@state.index $(target).data 'index'
					@controls.find('.list').closest('li').children('div').fadeOut()
					false
			
			# List visibility
			@controls.find('.list').event('click')
				.subscribe ({target}) =>
					div = $(target).closest('li').children 'div'
					if div.is ':visible'
						div.fadeOut()
					else
						list = div.children 'ul'
						list.children().remove()
						@cardListView.cards.each (card,index) ->
							list.append $("<li><a data-index='#{index}' href='#'>#{card.title}</a></li>")
						div.fadeIn()
				
			# Drag
			# @element.event('mousemove').map( (event) -> event.screenX )
			# 	.between(
			# 		@element.event('mousedown').map( (event) -> [event.screenX,$(window).scrollLeft()] ),
			# 		$(document).event('mouseup')
			# 	)
			# 	.subscribe (currentScreenX,[startScreenX,startScroll]) =>
			# 		$(window).scrollLeft( startScroll + startScreenX - currentScreenX )
				
		scrollTo: (index,duration=300) ->
			li = @cardListView.element.find('li.card').eq(index)
			if li.length > 0
				@element.stop().animate
#					scrollLeft: Math.min(li.position().left - @offset ,li.position().left+li.width()-@element.width() - @offset)+'px'
					scrollLeft: @element.scrollLeft() + li.position().left + parseInt(li.css('margin-left'),10)+'px'
					duration
					
		nudge: ->
			scrollLeft = @element.scrollLeft()
			@element.animate
				scrollLeft: parseInt(scrollLeft,10)+200,
				500,
				=> jm.event.after(500).subscribe =>
					@element.animate
						scrollLeft: scrollLeft,
						500
			
		zoom: (event) ->
			
			@element.addClass 'zoomed'
		
			@offsets = []
			@width   = 0
			
			@cardListView.element.children('li').each (index,item) =>
				@offsets.push $(item).position().left
				@width += $(item).outerWidth true
			
			after(1) =>
				@scrollLeft = @element.scrollLeft()
				scale = @element.outerWidth() / @width
				@cardListView.element.css 
					'position': 'relative'
					'-webkit-transform': 'scale('+scale+')'
					'left': @scrollLeft
				# $('ul.cards > li > h2 > span').css
				# 				 	'-webkit-transform': 'scale('+(1/scale)+')'
				
		unzoom: ({target}) ->
			
			if @element.hasClass 'zoomed'
				
				targetIndex = $(target).closest('ul.cards > li').index()
				
				@cardListView.element.css
					'-webkit-transform': 'none'
					'left': @scrollLeft-@offsets[targetIndex]+'px'
				after(1) => @element.removeClass 'zoomed'
				after(350) =>
					@element.addClass 'no_animation'
					@cardListView.element.css 'left','0px'
					@element.scrollLeft Math.min(@offsets[targetIndex],@width-@element.width())
					after(10) =>
						@element.removeClass 'no_animation'
						
				return false;
	
	
	##
	## Route
	##
	
	class Route
		
		constructor: (pattern,@cardType) ->
			@keys    = ( key.replace('{','').replace('}','').replace('?','') for key in ( pattern.match(/\{[^\}]+\}/g) || ['id'] ) )
			@pattern = new RegExp '^'+String(pattern).replace('/','\/').replace(/\/?\{[^\}]+\?\}/g,'(?:/?([^\/]+))?').replace(/\/?\{[^\}]+\}/g,'(?:/?([^\/]+))')+'/?$'
			
		test: (path) -> @pattern.test path
		
		match: (path) ->
			[_,values...] = @pattern.exec path
			keys = {}
			keys[key] = values?[index] for key, index in @keys
			keys
	
	##
	## Router
	##
	
	class Router
		
		constructor: (@routes) ->
			
		resolve: (url) ->
			
			[url,fragment] = url.split '#'
			[_,path,query] = url.match /([^\?]*)\??(.*)/
			
			# Find first matching route
			[route] = ( route for route in @routes when route.test path )
			
			if route
			
				# Find keys from route
				keys = route.match path
				
				# Convert URL parameters to object
				parameters = fragment: fragment
				parameters[name] = value for [name,value] in ( param.split('=') for param in query.split('&') )
						
				return [ route.cardType , keys || {}, parameters || {} ]
				
			return false
	
			
	##
	## Controller
	##
	
	class Controller
		
		constructor: (@cardList,@view,@viewport,@element) ->
			
			$(document).event('click','a[href]')
				.notBetween(
					$(document).event('keydown').where(jm.key(':leftcmd',':ctrl')),
					$(document).event('keyup').where(jm.key(':leftcmd',':ctrl'))
				)
				.subscribe (event) => @handle event, true
				
			$(document).event('click','a[href]')
				.between(
					$(document).event('keydown').where(jm.key(':leftcmd',':ctrl')),
					$(document).event('keyup').where(jm.key(':leftcmd',':ctrl'))
				)
				.subscribe (event) => @handle event, false
				
		handle: ({target},animate) ->
				
			open = (href) -> window.open href, (Date()).split(' ').join('')
			
			a = $(target).closest 'a'
			before = a.hasClass 'before'
			href = a.attr 'href'
			[_,path,fragment,query] = href.match( /([^#\?]*)((?:#)[^\?]*)?(\?.*)?/ ) or []
			[protocol] = href.match( /^([^:\?]*):.*/ ) or ['https']
			li = a.closest 'li.card'
			
			currentIndex = if li.length == 0 then $('li.card').length else li.index('li.card') + 1
			url = "https://#{location.host}/#{path}"
			
			if @cardList.handle url, currentIndex
				return false

			if path == location.origin + location.pathname
				location.hash = '#'+fragment
				$(document).scrollTop 0
				return false
			else if a.attr 'download'
				return true
			else if a.hasClass 'permalink'
				open href
				return false
			# else if cardType?
			#
			# 	if a.is '.disabled' then return false
			#
			# 	a.addClass 'disabled'
			#
			# 	card.url = href
			#
			# 	if animate
			# 		@view.event('ready')
			# 			.where( (inserted) -> inserted == card )
			# 			.subscribe =>
			# 				a.removeClass 'disabled'
			# 				@viewport.state.index card.li.index('li.card')
					
			else if href[0] == '#' and protocol not in ['mailto']
				history.pushState null, null, window.location.pathname + href
			else if protocol not in ['mailto','javascript']
				open href
				
			return protocol == 'mailto'
		
				
	##
	## CardApplication
	##
	
	class Application
		
		constructor: (element,menuElement,@external,constructors) ->
			
			@constructors = constructors
			@element      = $ element
			@menuElement  = $ menuElement
			
			@events = new jm.EventRegistry 'initialised','ready'
			@event('initialised').remember 1
			@event('ready').remember 1			
			@event('ready').subscribe => @element.removeClass 'loading'
			
			@cards = new CardList
				types: constructors
				external: @external
				application: this
			
			@view       = new ListView @cards, @element
			@viewport   = new ViewPort @view, @element, @menuElement, @external.offset?
			@controller = new Controller @cards, @view, @viewport, @element
			
			numberCards = @element.children('li.card').length
			@element.children 'li.card'
				.each (index,li) =>
					
					url = $(li).data 'url'
					$(li).remove()
					
					@cards.handle url, index

					@viewport.state.index @cards.count()
					if @cards.cards.count() == numberCards
						@event 'initialised'
							.raise()
			
		event: (name) -> @events.get name
			

	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		AjaxCard: AjaxCard
		CardList: CardList
		ListView: ListView
		ViewPort: ViewPort
		Route: Route
		Router: Router
		Controller: Controller
		Application: Application
	}