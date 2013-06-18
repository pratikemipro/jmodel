##
## Sapphire JavaScript Library: List
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.List = class List
	
		constructor: ( elements=[] ) ->
			if elements not instanceof Array then elements = [elements]
			@add element for element in elements
	
		add: Function.Chaining (element) ->
			Array::push.call this, element
	
		member: (element) ->
			-1 != Array::indexOf.call this, element
			
		map: Function.From(Function).Returning(-> new List) \
			(mapped) -> (fn) ->
				mapped.add fn element for element in this
	
		@concat: (base,others...) ->
			new base.constructor Array::concat.apply \
				Array::slice.call(base),
				( Array::slice.call(other) for other in others )

		@Of: (cons) ->
			class extends this
				add: (element) -> super @ensure element
				ensure: Object.ensure cons