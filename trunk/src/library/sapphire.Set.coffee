##
## Sapphire JavaScript Library: Set
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Set = class Set
	
		# Tests: partial
		constructor: ( elements=[] ) ->
			if elements not instanceof Array then elements = [elements]
			@add element for element in elements
		
		# Tests: none
		add: Function.Chaining (element) ->
			if not @member element then Array::push.call this, element
		
		# Tests: none
		remove: (predicate) ->
			Array::splice.call this, 0, @length, ( element for element in this when not predicate element )
		
		# Tests: none	
		replace: (before,after) ->
		
		# Tests: none
		member: (element) ->
			-1 != Array::indexOf.call this, element
		
		# Tests: full	
		count: (predicate) ->
			return @length if predicate == undefined
			reduction = (sum,element) -> sum += if predicate element then 1 else 0 
			@reduce reduction, 0
		
		# Tests: full
		where: Function.From(Function).Returning(-> new Set ) \
			(set) -> (predicate) ->
				set.add element for element in this when predicate element
		
		# Tests: none
		each: (fn) ->
			fn element for element in this
		
		# Tests: full
		map: Function.From(Function).Returning(-> new Set) \
			(mapped) -> (fn) ->
				mapped.add fn element for element in this
		
		# Tests: none
		reduce: (reduction,initial) ->
			Array::reduce.call this, reduction, 0
		
		# Tests: full
		partition: Function.From(Function).Returning(-> new ( Map.To(Set).Using Set.union ) ) \
			 (map) -> (key) ->
				 for element in this
					 map.add key(element), element
		
		# Tests: full
		@union: Function.From([Set]).Returning(-> new Set) \
			(union) -> (sets...) ->
				union.add element for element in set for set in sets
			
		# Tests: none
		@intersection: ->
		
		# Tests: full
		@difference: Function.From(Set,Set).Returning(-> new Set) \
			(difference) -> (first,second) ->
				difference.add element for element in first when not second.member element
		
		# Tests: none
		@Of: (cons) ->
			class extends this
				add: (element) -> super @ensure element
				ensure: Object.ensure cons