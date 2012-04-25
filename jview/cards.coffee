define ['jquery','jmodel/topaz'], ($,jm) ->

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn


	##
	## Card
	##	
	
	class Card
		
		constructor: ->
		
			@events = new jm.EventRegistry 'ready'
			@event('ready').remember 1
		
			@li ?= $ '<li class="card"/>'
		
			@li.addClass(@class)
			
			@li.on 'click', 'button.close', =>
				@list.remove this
				
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
			
		init: (html) ->
			@li.html html
			@event('ready').raise()
	

	##
	## CardList
	##

	class CardList
	
		constructor: ->
			
			@cards  = new jm.ObservableTypedList(Card)
			@events = new jm.EventRegistry 'add', 'insert', 'replace', 'remove', 'count'
			
			@cards.events.republish
				add:     @event 'add'
				insert:  @event 'insert'
				replace: @event 'replace'
				remove:  @event 'remove'
		
		event: (name) -> @events.get name
		
		# Delegation
		add:     (args...) -> @cards.add args...
		insert:  (args...) -> @cards.insert args...
		replace: (args...) -> @cards.replace args...
		remove:  (args...) -> @cards.remove args...
		get:	 (args...) -> @cards.get args...
		count:	 (args...) -> @cards.count args...
		
			
	##
	## CardListView
	##
	
	class CardListView
		
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
			card.event('ready').subscribe =>
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
			card.event('ready').subscribe =>
				li = card.li
				li.addClass 'adding'
				after(350) =>
					@element.find('li.card').eq(index-1).after li
					li.css 'width', li.children('section').outerWidth(true)
					after(@duration) =>
						li.removeClass 'adding'
						@event('ready').raise card
			
		replace: (before,card) ->
			card.event('ready').subscribe =>
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
	## CardListViewPort
	##
	
	class CardListViewPort
		
		@offsets: []
		@width: 0
		@scrollLeft: 0
		
		constructor: (@cardListView,element) ->
			
			@element = $ element
			@state   = new jm.ObservableObject index: Number(0)
			
			# Changing state scrolls to card
			@state.event('index').subscribe (index) => @scrollTo index
			
			# New cards become current card
			@cardListView.event('ready').subscribe (card) => 
				@state.index card.li.index('li.card')
			
			# Clicing on a card makes it the current card
			@cardListView.element.event('click','li.card')
			.where( (event) -> $(event.target).closest('a').length == 0 )
			.subscribe (event) => 
				@state.index $(event.target).closest('li.card').index('li.card') 

			# Keyboard control
			keyEvent = @element.event('keydown').where (event) ->
				$(event.target).closest('input,select,textarea,[contentEditable=true]').length == 0
			
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
			.subscribe => @element.children('nav').toggleClass 'hidden', @cardListView.cards.count() == 1
			
			# Zoom
			@element.children('nav').find('button.zoom').event('click').subscribe (event) => @zoom event
			
			# Unzoom
			@cardListView.element.event('click','li.card').subscribe (event) => @unzoom event
			
			# Clear
			@element.children('nav').find('button.close').event('click').subscribe => 
				@cardListView.cards.remove (card) -> card.li.index('li.card') > 0
			
			# Count
			jm.disjoin(
				@cardListView.event('ready'),
				@cardListView.event('removed')
			)
			.subscribe =>
				count =  @cardListView.cards.count()
				@element.children('nav').find('.count').text( count + ' cards' )
				
		scrollTo: (index,duration=1000) ->
			li = @cardListView.element.find('li.card').eq(index)
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
				
		unzoom: (event) ->
			
			if @element.hasClass 'zoomed'
				
				targetIndex = $(event.target).closest('ul.cards > li').index()
				
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
	## CardListController
	##
	
	class CardListController
		
		constructor: (@cardList,@element,@cardTypes) ->
			
			@element.event('click','a[href]').subscribe (event) =>	
		
				open = (href) -> window.open href, (Date()).split(' ').join('')
			
				a    = $(event.target).closest 'a'
				href = a.attr 'href'
				li   = a.closest 'li.card'

				[_,type,id,query] = href.match /([^\/]+)\/([^\?]+)\??(.*)/
			
				parameters = {}
				parameters[name] = value for [name,value] in ( param.split('=') for param in query.split('&') )
			
				currentIndex = li.index('li.card') + 1
			
				if a.hasClass 'permalink'
					open href
				else if @cardTypes[type]
					card = new @cardTypes[type] @cardList, id, undefined, parameters
					if card.li.hasClass('singleton') and li.hasClass('singleton') and @cardList.count() == 1
						@element.animate { scrollLeft: 0 }, 500, => @cardList.replace @cardList.get(0), card
					else
						@cardList.insert currentIndex, card
				else 
					open href
				
				return false
			
			
			
			
			
	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		AjaxCard: AjaxCard
		CardList: CardList
		CardListView: CardListView
		CardListViewPort: CardListViewPort
		CardListController: CardListController
	}