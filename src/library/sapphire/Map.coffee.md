# Map

		
		window.Map = class Map
			
			constructor: ( mappings ) ->
				@_ = {}
				@add mappings if mappings instanceof Object
	
			add: Function.overload [	
				Function.From(Scalar,Value) Function.Chaining (key,value) -> @_[key] = value
				Function.From(Object)       Function.Chaining (mappings) -> @add(key,value) for own key, value of mappings
			]
			
			remove: Function.Chaining (key) -> delete @_[key]
	
			get: (key) -> @_[key]
			
			keys: -> new Set ( key for own key of @_ )
	
			each: (fn) -> fn(key,value) for own key, value of @_
	
			ensure: Function.identity
			

## Typed maps

			
			@To: (constructor) ->
				class extends this
				
					add: this::add.extend [			
						Function.From(Scalar,Value) Function.Chaining (key,value) -> @_[key] = @ensure value
						Function.From(Array)        Function.Chaining (keys) -> @add key, @ensure() for key in keys
					]
					
					ensure: Object.ensure constructor
					
					@value_constructor: constructor
			
			@Using: (combine) ->
				combine = combine.bind @value_constructor
				class extends this
					add: this::add.extend [
						Function.From(Scalar,Value) Function.Chaining (key,value) ->
							@_[key] = if not @_[key] then @ensure(value) else combine @ensure(value), @_[key]
					]
					
