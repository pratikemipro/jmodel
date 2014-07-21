# List
		
		window.List = class List
	
			constructor: ( elements=[] ) ->
				if typeof elements == 'string' or arguments.length > 1 or not elements.length? then elements = Array::slice.call arguments
				@add element for element in elements
	
			add: Function.Chaining (element) ->
				Array::push.call this, element
	
			member: (element) ->
				-1 != Array::indexOf.call this, element
		
			where: Function.From(Function) (predicate) ->
				new @constructor ( element for element in this when predicate.call element, element )
				
			map: Function.From(Function) (fn) ->
				new @constructor ( fn.call element, element for element in this )
	
			mapAll: Function.From(Function) (fn) ->
				new @constructor Array.flatten ( Array::slice.call(fn.call element, element) for element in this )
	
			@concat: (lists...) ->
				new this Array.concat lists...
					
			@Of: Function.Cache.From(Function) (constructor) ->
				class extends this
					add: Function.Of(constructor) this::add
					
