define ['jquery','jmodel/topaz','jmodel-plugins/jquery.emerald','jmodel-plugins/emerald.keys'], ($,jm) ->

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn


	##
	## Card
	##	
	
	class Card
		
		constructor: ->
		
			@events = new jm.EventRegistry 'ready', 'dispose'
			@event('ready').remember 1
		
			@li ?= $ '<li class="card"/>'
		
			@li.addClass(@class)
			
			@li.on 'click', 'button.close', =>
				@event('dispose').raise this
				
		event: (name) -> @events.get name
	
	
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
			@event('ready').raise this
	

	##
	## List
	##

	class List
	
		constructor: (@external) ->
			
			@cards  = new jm.ObservableTypedList(Card)
			@events = new jm.EventRegistry 'add', 'insert', 'replace', 'remove', 'count', 'ready'
			@event('ready').remember 1
			
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
				card.event('ready').subscribe   (card) => @event('ready').raise card
				card.event('dispose').subscribe (card) => @cards.remove card
		
		event: (name) -> @events.get name
		
		# Delegation
		add:     (args...) -> @cards.add args...
		insert:  (args...) -> @cards.insert args...
		replace: (args...) -> @cards.replace args...
		remove:  (args...) -> @cards.remove args...
		get:	 (args...) -> @cards.get args...
		count:	 (args...) -> @cards.count args...
		
			
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
					'left': (-1*$(li).offset().left+100*index)+'px'
		
		## Adding a card creates a new extent
		add: (card) ->
			@element.find('li.card').removeClass 'zoomed'
			@element.append '<li class="extent"><ul><li class="label hidden"></li></ul></li>'
			card.event('ready').take(1).subscribe =>
				card.li.children().addClass 'adding'
				after(350) =>
					@element.children('li.extent:last').children('ul').append card.li
					after(1) =>
						card.li.children().removeClass 'adding'
						@event('ready').raise card
						after(350) => @element.find('li.extent > ul > li.label').removeClass 'hidden'
					
		## Inserting a card uses an existing extent
		insert: (card,index) ->
			cards = @element.find 'li.card'
			cards.removeClass 'zoomed'
			@element.find('li.extent > ul > li.label').removeClass 'hidden'
			card.event('ready').take(1).subscribe =>
				li = card.li
				li.addClass 'adding'
				after(350) =>
					@element.find('li.card').eq(index-1).after li
					li.css 'width', li.children('article').outerWidth(true)
					after(@duration) =>
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
				after(@duration) =>
					extent = li.closest 'li.extent'
					li.remove().removeClass 'removing'
					li.children().removeClass 'removing'
					@event('removed').raise card
					if extent.find('li.card').length == 0
						extent.remove()
					if @cards.count() == 1
						after(350) =>
							@element.find('li.card').addClass 'zoomed'
							@element.find('li.extent > ul > li.label').addClass 'hidden'
	

	##
	## ViewPort
	##
	
	class ViewPort
		
		@offsets: []
		@width: 0
		@scrollLeft: 0
		
		constructor: (@cardListView,element,controls) ->
			
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
				@state.index target.closest('li.card').index('li.card') 

			# Keyboard control
			keyEvent = @element.event('keydown').where ({target}) -> $(target).closest('input,select,textarea,[contentEditable=true]').length == 0
			
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
				count =  @cardListView.cards.count()
				@controls.find('.count').text( count + ' cards' )
				
			# Drag
			# @element.event('mousemove').map( (event) -> event.screenX )
			# 	.between(
			# 		@element.event('mousedown').map( (event) -> [event.screenX,$(window).scrollLeft()] ),
			# 		$(document).event('mouseup')
			# 	)
			# 	.subscribe (currentScreenX,[startScreenX,startScroll]) =>
			# 		$(window).scrollLeft( startScroll + startScreenX - currentScreenX )
				
		scrollTo: (index,duration=1000) ->
			li = @cardListView.element.find('li.card').eq(index)
			if li.length > 0
				@element.animate
					scrollLeft: Math.max(li.offset().left - 64 ,li.offset().left+li.width()-@element.width() - 64)+'px'
					scrollTop: '0px',
					duration
			
		zoom: (event) ->
			
			@element.addClass 'zoomed'
		
			@offsets = []
			@width   = 0
			
			@cardListView.element.children('li').each (index,item) =>
				@offsets.push $(item).offset().left
				@width += $(item).outerWidth true
			
			after(1) =>
				@scrollLeft = @element.scrollLeft()
				scale = @element.outerWidth()/@width
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
			@pattern = if pattern instanceof RegExp then pattern else @compile pattern
			
		compile: (pattern) ->
			new RegExp '^'+String(pattern).replace('/','\/').replace(/\{[^\}]+\}/,'(\\d+)')+'/?$'
	
	##
	## Router
	##
	
	class Router
		
		constructor: (@routes) ->
			@routes.sort ( (route) -> route.pattern.toString().length ).desc()
			
		resolve: (url) ->
			
			[_,path,query] = url.match /([^\?]*)\??(.*)/
			
			# Find first matching route
			[route] = ( route for route in @routes when route.pattern.test path )
			
			if route
			
				# Find keys from route
				[_,keys...] = route.pattern.exec path 
			
				# Convert URL parameters to object
				parameters = {}
				parameters[name] = value for [name,value] in ( param.split('=') for param in query.split('&') )
						
			return [ route?.cardType, keys || [], parameters || {} ]
	
			
	##
	## Controller
	##
	
	class Controller
		
		constructor: (@cardList,@view,@viewport,@element,@router) ->
			
			@element.event('click','a[href]')
				.notBetween(
					$(document).event('keydown').where(jm.key(':leftcmd',':ctrl')),
					$(document).event('keyup').where(jm.key(':leftcmd',':ctrl'))
				)
				.subscribe (event) => @handle event, true
				
			@element.event('click','a[href]')
				.between(
					$(document).event('keydown').where(jm.key(':leftcmd',':ctrl')),
					$(document).event('keyup').where(jm.key(':leftcmd',':ctrl'))
				)
				.subscribe (event) => @handle event, false
				
		handle: ({target},animate) ->
				
			open = (href) -> window.open href, (Date()).split(' ').join('')
			
			a    = $(target).closest 'a'
			href = a.attr 'href'
			li   = a.closest 'li.card'

			currentIndex = li.index('li.card') + 1
			
			[cardType,[id],parameters] = @router.resolve href
			
			if a.hasClass 'permalink'
				open href
				return false
			else if cardType
				card = new cardType @cardList, id, undefined, parameters
				if card.li.hasClass('singleton') and li.hasClass('singleton') and @cardList.count() == 1
					@element.animate { scrollLeft: 0 }, 500, => @cardList.replace @cardList.get(0), card
				else
					@cardList.insert currentIndex, card
			else 
				open href
							
			if animate
				@view.event('ready')
					.where( (inserted) -> inserted == card )
					.subscribe =>
						@viewport.state.index card.li.index('li.card')
				
			return false
		
				
	##
	## CardApplication
	##
	
	class Application
		
		constructor: (element,menuElement,@external,@constructors) ->
			
			@element     = $ element
			@menuElement = $ menuElement
			
			@events = new jm.EventRegistry 'ready'
			@event('ready').remember 1			
			@event('ready').subscribe => @element.removeClass 'loading'
			
			@cards  = new List @external
			@router = new Router ( new Route(card::route,card) for card in @constructors )
			
			rootCardElement = @element.find 'ul.cards li.card'
			[cardType] = @router.resolve window.location.pathname.substring 1
			
			rootCard = new cardType @cards, undefined, rootCardElement, zoomed: !rootCardElement?
			rootCard.event('ready').republish @event 'ready'
			
			if rootCardElement then @cards.add rootCard
			
			@view       = new ListView @cards, @element.find('ul.cards')
			@viewport   = new ViewPort @view, @element, @menuElement
			@controller = new Controller @cards, @view, @viewport, @element, @router
			
			if !rootCardElement then @cards.add rootCard
			
		event: (name) -> @events.get name
			

	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		AjaxCard: AjaxCard
		List: List
		ListView: ListView
		ViewPort: ViewPort
		Route: Route
		Router: Router
		Controller: Controller
		Application: Application
	}