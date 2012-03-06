define ['jquery','jmodel/topaz'], ($,jm) ->

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn


	##
	## Card
	##	
	
	class Card
		
		class: ''
		load: null
		
		constructor: ->
		
			@events = new jm.EventRegistry 'ready'
			@events.add 'load', jm.event.fromAjax @load
		
			@li = $('<li class="card"/>').addClass(@class)
			
			@li.on 'click', 'button.close', =>
				@list.remove this
			
			if @event('load')
				@event('load').subscribe (html) => @init html
				
		event: (name) -> @events.get name
		init: ->
	

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
		
		add: (card) ->
			card.event('ready').subscribe =>
				@element.children().removeClass 'zoomed'
				card.li.children().addClass 'adding'
				after(350) =>
					@element.append card.li
					after(1) =>
						card.li.children().removeClass 'adding'
						after(350) => @event('ready').raise card
					
		
		insert: (card,index) ->
			card.event('ready').subscribe =>
				@element.children().removeClass 'zoomed'
				li = card.li
				li.addClass 'adding'
				after(350) =>
					@element.children('li').eq(index-1).after li
					li.css 'width', li.children('section').outerWidth(true)
					after(@duration) =>
						li.removeClass 'adding'
						after(350) => @event('ready').raise card
			
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
					li.remove().removeClass 'removing'
					@event('removed').raise card
					if @cards.count() == 1
						after(350) => @element.children().addClass 'zoomed'
	

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
			@cardListView.event('ready').subscribe (card) => @state.index card.li.index()
			
			# Removing a card decrements current index
			@cardListView.event('removed').subscribe => @state.index @state.index()-1

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
			.subscribe => @element.children('nav').toggleClass 'hidden', @cardListView.element.children('li').length == 1
			
			# Zoom
			@element.children('nav').find('button.zoom').event('click').subscribe (event) => @zoom event
			
			# Unzoom
			@cardListView.element.event('click','li.card').subscribe (event) => @unzoom event
				
		scrollTo: (index,duration=1000) ->
			li = @cardListView.element.children('li').eq(index)
			@element.animate
				scrollLeft: Math.max(li.offset().left,li.offset().left+li.width()-@element.width())+'px'
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
	## Return constructors
	##
			
	return {
		Card: Card
		CardList: CardList
		CardListView: CardListView
		CardListViewPort: CardListViewPort
	}