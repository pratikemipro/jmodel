window.Map = class Map
	
	constructor: ( mappings={} ) ->
		@add key, value for own key, value of mappings
	
	add: (key,value) ->
		switch arguments.length
			when 2 then @[key] = value
			else @add(key,value) for own key, value of key
	
	remove: (key) -> @[key] = undefined
	
	get: (key) -> @[key]
	
	each: (fn) -> fn(key,value) for own key, value of @
	
	ensure: (x) -> x

	@To: (cons) ->
		class extends @
			add: (key,value) -> super key, @ensure(value)
			ensure: (value) -> if value instanceof cons then value else new cons value
	
	@Using: (combine) ->
		class extends @
			add: (key,value) ->
				super key, if !@[key] then @ensure(value) else combine @ensure(value), @ensure(@[key])