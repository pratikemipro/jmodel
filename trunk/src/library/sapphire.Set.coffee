##
## Sapphire JavaScript Library: Set
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Set = class Set
	
		constructor: ( elements=[] ) ->
			if elements not instanceof Array then elements = [elements]
			@add element for element in elements
		
		add: (element) ->
			if @.member element then @ else Array::push.call @, element
		
		remove: (predicate) ->
			Array::splice.call @, 0, @.length, ( x for x in @ when not predicate x )
		
		member: (element) ->
			-1 != Array::indexOf.call @, element
		
		@union: (sets...) ->
			new @.constructor ( x for x in set for set in sets )
		
		@intersection: ->
		
		@difference: ->