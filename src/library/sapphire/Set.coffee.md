# Set

		
		window.Set = class Set
			
			constructor: ( elements=[] ) ->
				if typeof elements == 'string' or arguments.length > 1 or not elements.length? then elements = Array::slice.call arguments
				@length = 0
				@add element for element in elements
		

## Mutators

			
			add: Function.Chaining (element) ->
				if not @member element then Array::push.call this, element
			
			remove: Function.From(Maybe Function) (predicate=Boolean.True) ->
				partition = @partition predicate
				Array::splice.apply this, [0,@length,( element for element in partition.get(false) ? [] )...]
				return partition.get(true) ? new @constructor
		

## Pure methods

			
			member: Predicate.From(Maybe Value) (element) ->
				-1 != Array::indexOf.call this, element
			
			count: Function.From(Maybe Function).To(Number) (predicate) ->
				return @length if predicate == undefined
				@reduce Array.count(predicate), 0
				
			exists: Function.From(Function).To(Boolean) (predicate) ->
				0 != @count predicate
			
			where: Function.From(Function) (predicate) ->
				new @constructor ( element for element in this when predicate.call element, element )
			
			each: Function.From(Function) (fn) ->
				fn.call element, element for element in this
				
			map: Function.From(Function) (fn) ->
				new @constructor ( fn.call element, element for element in this )
				
			mapAll: Function.From(Function) (fn) ->
				new @constructor Array.flatten ( Array::slice.call(fn.call element, element) for element in this )
			
			reduce: Function.From(Function,Maybe Value) (reduction,initial) ->
				Array::reduce.apply this, [reduction, (if initial? then [initial] else [])...]
			
			partition: Function.From(Function).Returning(-> new ( Map.To(Set).Using Set.union ) ) \
				 (map) -> (key) ->
					 for element in this
						 map.add key.call(element,element), element
					 

## Comparisons

			
			@subset: Predicate.From(Set,Set) (first,second) ->
				Array.reduce(Boolean.and) ( second.member element for element in first )
			
			@equal: Predicate.From(Set,Set) (first,second) ->
				first.count() == second.count() and Set.subset(first,second) and Set.subset(second,first)
		

## Set algebra

			
			@union: Function.From([Set]) (sets...) ->
				new this Array.concat ( element for element in set for set in sets )...
				
			@intersection: Function.From([Set]) (first=[],rest...) ->
				new this ( element for element in first when rest.all -> @member element )
			
			@difference: Function.From(Set,Set) (first=[],rest...) ->
				new this ( element for element in first when rest.none -> @member element )
			
			@product: Function.From([Set]).Returning(-> new this ) \
				(product) -> (sets...) ->
				

## Casting

			
			to: Function.From(Function) (constructor) ->
				new constructor (element for element in this)
		

## Typed sets

			
			@Of: Function.Cache.From(Function) (constructor) ->
				class extends this
					add: Function.Of(constructor) this::add
					
