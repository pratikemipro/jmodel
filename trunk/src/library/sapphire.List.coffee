define ->
	
	window.List = class List
	
		constructor: ( elements=[] ) ->
			if elements not instanceof Array then elements = [elements]
			@add element for element in elements
	
		add: (element) ->
			Array::push.call @, element
			this
	
		member: (element) ->
			-1 != Array::indexOf.call @, element
	
		@concat: (base,others...) ->
			new base.constructor Array::concat.apply \
				Array::slice.call(base),
				( Array::slice.call(other) for other in others )

		@Of: (cons) ->
			class extends @
				add: (element) -> super @ensure element
				ensure: (value) -> if value instanceof cons then value else new cons value