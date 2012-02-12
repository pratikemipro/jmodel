define ['jquery','jmodel/topaz'], ($,jm) ->

	# Utility functions
	after = (period) -> (fn) -> jm.event.after(period).subscribe fn


	##
	## Card
	##	
	
	class Card
		constructor: () ->
			@li = $ '<li/>'
	

	##
	## CardList
	##

	class CardList
	
		constructor: ->
			
			@cards  = new jm.ObservableTypedList(Card)
			@events = new jm.EventRegistry 'add', 'insert', 'remove'
			
			@cards.events.republish
				add: @event 'add'
				insert: @event 'insert'
				remove: @event 'remove'
		
		event: (name) -> @events.get name
		
		# Delegation
		add:    (args...) -> @cards.add args...
		insert: (args...) -> @cards.insert args...
		remove: (args...) -> @cards.remove args...
			
			
	##
	## CardListView
	##
	
	class CardListView
		
		constructor: (cards,element,duration=750) ->
			
			@cards	  = cards
			@element  = $ element
			@duration = duration
			
			@cards.events.subscribe
				add:    (args...) => @add args...
				insert: (args...) => @insert args...
				remove: (args...) => @remove args...
				
		add: (card) ->
			card.li.children().addClass 'adding'
			@element.append card.li
			after(1) -> card.li.children().removeClass 'adding'
		
		insert: (card,index) ->
			li = card.li.addClass 'adding'
			@element.children('li').eq(index).before li
			li.css 'width', li.children('section').outerWidth(true)
			after(@duration) -> li.removeClass 'adding'
			
		remove: (card) ->
			li = card.li
			li.children().addClass 'removing'
			after(@duration) ->
				li.addClass 'removing'
				after(@duration) -> li.remove()
	
	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		CardList: CardList
		CardListView: CardListView
	}