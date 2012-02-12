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
			@events = new topaz.EventRegistry 'add', 'insert'
			
			@cards.events.republish
				add: @event 'add'
				insert: @event 'insert'
		
		event: (name) -> @events.get name
		
		add: (args...) -> @cards.add args...
			
		insert: (index,card) ->
			## Temporary hack
			@cards.__rep__.splice index+1, 0, card
			@cards.event('insert').raise(card,index)
			
			
			
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
				
		add: (card) ->
			@element.append card.li
		
		insert: (card,index) ->
			li = card.li.addClass 'adding'
			@element.children('li').eq(index).before li
			li.css 'width', li.children('section').outerWidth(true)
			after(750) -> li.removeClass 'adding'
	
	
	##
	## Return constructors
	##
			
	return {
		Card: Card
		CardList: CardList
		CardListView: CardListView
	}