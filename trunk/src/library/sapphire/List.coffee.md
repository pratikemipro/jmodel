List
===
		
		window.List = class List
	
			constructor: ( elements=[] ) ->
				if elements not instanceof Array then elements = [elements]
				@add element for element in elements
	
			add: Function.Chaining (element) ->
				Array::push.call this, element
	
			member: (element) ->
				-1 != Array::indexOf.call this, element
		
			where: Function.From(Function).Returning(-> new List ) \
				(list) -> (predicate) ->
					List.add element for element in this when predicate element
			
			map: Function.From(Function).Returning(-> new List) \
				(mapped) -> (fn) ->
					mapped.add fn element for element in this
	
			@concat: (base,others...) ->
				new base.constructor Array::concat.apply \
					Array::slice.call(base),
					( Array::slice.call(other) for other in others )
					
			@Of: Function.From(Function) (constructor) ->
				class extends this
					add: Function.Of(constructor) this::add
					
