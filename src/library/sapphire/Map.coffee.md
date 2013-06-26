# Map

		
		window.Map = class Map
			
			constructor: ( mappings={} ) ->
				@add key, value for own key, value of mappings
	
			add: Function.switch [	
				Type(Value,Value) Function.Chaining (key,value) -> @[key] = value
				Type(Object)	  Function.Chaining (mappings) -> @add(key,value) for own key, value of mappings
			]
			
			remove: Function.Chaining (key) -> delete @[key]
	
			get: (key) -> @[key]
			
			keys: -> new Set ( key for own key of this )
	
			each: (fn) -> fn(key,value) for own key, value of this
	
			ensure: Function.identity
			

## Typed maps

			
			@To: (constructor) ->
				class extends this
				
					add: this::add.extend [			
						Type(Value,Value) Function.Chaining (key,value) -> @[key] = @ensure value
						Type(Array)       Function.Chaining (keys) -> @add key, @ensure() for key in keys
					]
					
					ensure: Object.ensure constructor
			
			@Using: (combine) ->
				class extends this
					add: this::add.extend [
						Type(Value,Value) Function.Chaining (key,value) ->
							@[key] = if not @[key] then @ensure(value) else combine @ensure(value), @[key]
					]
					
