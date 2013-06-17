##
## Sapphire JavaScript Library: Set
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Set = class Set
	
		# Tests: full
		constructor: ( elements=[] ) ->
			if elements not instanceof Array or arguments.length > 1 then elements = Array::slice.call arguments
			@length = 0
			@add element for element in elements
		
		##
		## Mutators
		##
		
		# Tests: full
		add: Function.Chaining (element) ->
			if not @member element then Array::push.call this, element
		
		# Tests: full
		remove: Function.From(Maybe Function) (predicate=Boolean.True) ->
			partition = @partition predicate
			Array::splice.apply this, [0,@length].concat ( element for element in partition.get(false) ? [] )
			return partition.get(true) ? new @constructor
		
		# Tests: full	
		replace: Function.Chaining (before,after) ->
			index = Array::indexOf.call this, before
			this[index] = after if index != -1
		
		##
		## Pure methods
		##
		
		# Tests: full
		member: (element) ->
			-1 != Array::indexOf.call this, element
		
		# Tests: full	
		count: Function.From(Maybe Function) (predicate) ->
			return @length if predicate == undefined
			reduction = (sum,element) -> sum += if predicate element then 1 else 0 
			@reduce reduction, 0
		
		# Tests: full
		where: Function.From(Function).Returning(-> new Set ) \
			(set) -> (predicate) ->
				set.add element for element in this when predicate element
		
		# Tests: full
		each: (fn) ->
			fn element for element in this
		
		# Tests: full
		reduce: (reduction,initial) ->
			Array::reduce.apply this, [reduction].concat if initial? then [initial] else []
		
		# Tests: full
		partition: Function.From(Function).Returning(-> new ( Map.To(Set).Using Set.union ) ) \
			 (map) -> (key) ->
				 for element in this
					 map.add key(element), element
					 
		##
		## Comparisons
		##
		
		# Tests: full
		@subset: Function.From(Set,Set).To(Boolean) \
			(first,second) ->
				[true]
					.concat( second.member element for element in first )
					.reduce (a,b) -> a and b
		
		# Tests: full
		@equal: Function.From(Set,Set).To(Boolean) \
			(first,second) ->
				first.count() == second.count() and Set.subset(first,second) and Set.subset(second,first)
		
		##
		## Set algebra
		##
		
		# Tests: full
		@union: Function.From([Set]).Returning(-> new Set) \
			(union) -> (sets...) ->
				union.add element for element in set for set in sets
			
		# Tests: full
		@intersection: Function.From([Set]).Returning(-> new Set) \
			(intersection) -> (first=[],rest...) ->
 				intersection.add element for element in first when \
 					[true].concat( set.member element for set in rest ).reduce (a,b) -> a and b
		
		# Tests: full
		@difference: Function.From(Set,Set).Returning(-> new Set) \
			(difference) -> (first,second) ->
				difference.add element for element in first when not second.member element
				
		# Tests: none
		@product: Function.From([Set]).Returning(-> new Set ) \
			(product) -> (sets...) ->
				
		##
		## Casting
		##

		# Tests: full
		to: Function.From(Function) (cons) -> new cons (element for element in this)
		
		##
		## Typed Sets
		##
		
		# Tests: none
		@Of: (cons) ->
			class extends this
				add: (element) -> super @ensure element
				ensure: Object.ensure cons