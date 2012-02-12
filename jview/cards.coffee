define ['jquery','jmodel/topaz'], ($,topaz) ->

	## Utility functions
	after = (period) -> (fn) -> topaz.event.after(period).subscribe fn


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
			
			@cards  = new topaz.ObservableTypedList(Card)
			@events = new topaz.EventRegistry 'add', 'insert', 'remove'
			
			@cards.events.republish
				add: @event 'add'
				insert: @event 'insert'
				remove: @event 'remove'
		
		event: (name) -> @events.get name
		
		## Delegation
		add:    (args...) -> @cards.add args...
		insert: (args...) -> @cards.insert args...
		remove: (args...) -> @cards.remove args...
			
			
	##
	## CardListView
	##
	
	class CardListView
		
		constructor: (cards,element) ->
			
			@cards	 = cards
			@element = $ element
			
			@cards.events.subscribe
				add: (args...) => @add args...
				insert: (args...) => @insert args...
				remove: (args...) => @remove args...
				
		add: (card) ->
			@element.append card.li
		
		insert: (card,index) ->
			li = card.li.addClass 'adding'
			@element.children('li').eq(index).before li
			li.css 'width', li.children('section').outerWidth(true)
			after(750) -> li.removeClass 'adding'
			
		remove: (card) ->
			li = card.li
			li.children().addClass 'removing'
			after(750) ->
				li.addClass 'removing'
				after(750) -> li.remove()
	
	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		CardList: CardList
		CardListView: CardListView
	}