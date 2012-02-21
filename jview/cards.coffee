define ['jquery','jmodel/topaz'], ($,jm) ->

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn


	##
	## Card
	##	
	
	class Card
		
		constructor: ->
		
			@li = $ '<li class="card"/>'
			
			@li.on 'click', 'button.close', =>
				@list.remove this
	

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
		
		constructor: (cards,element,duration=750) ->
			
			@cards	  = cards
			@element  = $ element
			@duration = duration
			
			@cards.events.subscribe
				add:     (args...) => @add args...
				insert:  (args...) => @insert args...
				replace: (args...) => @replace args...
				remove:  (args...) => @remove args...
				
		add: (card) ->
			@element.children().removeClass 'zoomed'
			card.li.children().addClass 'adding'
			after(350) =>
				@element.append card.li
				after(1) -> card.li.children().removeClass 'adding'
		
		insert: (card,index) ->
			@element.children().removeClass 'zoomed'
			li = card.li
			li.addClass 'adding'
			after(350) =>
				@element.children('li').eq(index-1).after li
				li.css 'width', li.children('section').outerWidth(true)
				after(@duration) -> li.removeClass 'adding'
			
		replace: (before,card) ->
			before.li
				.removeClass('zoomed')
				.after(card.li)
			card.li.removeClass 'zoomed'
			after(@duration) ->
				$('body').animate { scrollLeft: $('body').width() }, 1000, () ->
					before.li.remove()
					card.li.addClass 'zoomed'
			
		remove: (card) ->
			li = card.li
			li.children().addClass 'removing'
			after(@duration) =>
				li.addClass 'removing'
				after(@duration) =>
					li.remove().removeClass 'removing'
					if @cards.count() == 1
						after(350) => @element.children().addClass 'zoomed'
	

	# Bounce
	# 	em.event.after(300).subscribe ->
	# 		$('body').animate { scrollLeft: scrollLeft+200 }, 400, () ->
	# 			$('body').animate { scrollLeft: scrollLeft }, 400
	
	
	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		CardList: CardList
		CardListView: CardListView
	}