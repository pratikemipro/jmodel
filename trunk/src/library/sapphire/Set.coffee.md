# Set

		
		window.Set = class Set
			
			constructor: ( elements=[] ) ->
				if elements not instanceof Array or arguments.length > 1 then elements = Array::slice.call arguments
				@length = 0
				@add element for element in elements
		

## Mutators

			
			add: Function.Chaining (element) ->
				if not @member element then Array::push.call this, element
			
			remove: Function.From(Maybe Function) (predicate=Boolean.True) ->
				partition = @partition predicate
				Array::splice.apply this, [0,@length].concat ( element for element in partition.get(false) ? [] )
				return partition.get(true) ? new @constructor
			
			replace: Function.Chaining (before,after) ->
				index = Array::indexOf.call this, before
				this[index] = after if index != -1
		

## Pure methods

			
			member: Predicate.From(Maybe Value) (element) ->
				-1 != Array::indexOf.call this, element
			
			count: Function.From(Maybe Function).To(Number) (predicate) ->
				return @length if predicate == undefined
				reduction = (sum,element) -> sum += if predicate element then 1 else 0 
				@reduce reduction, 0
			
			where: Function.From(Function).Returning(-> new Set ) \
				(set) -> (predicate) ->
					set.add element for element in this when predicate element
			
			each: Function.From(Function) (fn) ->
				fn element for element in this
			
			reduce: Function.From(Function,Maybe Value) (reduction,initial) ->
				Array::reduce.apply this, [reduction].concat if initial? then [initial] else []
			
			partition: Function.From(Function).Returning(-> new ( Map.To(Set).Using Set.union ) ) \
				 (map) -> (key) ->
					 for element in this
						 map.add key(element), element
					 

## Comparisons

			
			@subset: Predicate.From(Set,Set) \
				(first,second) ->
					[true]
						.concat( second.member element for element in first )
						.reduce (a,b) -> a and b
			
			@equal: Predicate.From(Set,Set) \
				(first,second) ->
					first.count() == second.count() and Set.subset(first,second) and Set.subset(second,first)
		

## Set algebra

			
			@union: Function.From([Set]).Returning(-> new this) \
				(union) -> (sets...) ->
					union.add element for element in set for set in sets
			
			@intersection: Function.From([Set]).Returning(-> new this) \
				(intersection) -> (first=[],rest...) ->
	 				intersection.add element for element in first when \
	 					[true].concat( set.member element for set in rest ).reduce (a,b) -> a and b
			
			@difference: Function.From(Set,Set).Returning(-> new this) \
				(difference) -> (first,second) ->
					difference.add element for element in first when not second.member element
			
			@product: Function.From([Set]).Returning(-> new this ) \
				(product) -> (sets...) ->
				

## Casting

			
			to: Function.From(Function) (constructor) ->
				new constructor (element for element in this)
		

## Typed sets

			
			@Of: Function.From(Function) (constructor) ->
				class extends this
					add: Function.Of(constructor) this::add
					