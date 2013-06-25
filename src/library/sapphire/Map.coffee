##
## Sapphire JavaScript Library: Map
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Map = class Map
	
		# Tests: full
		# Docs: none
		constructor: ( mappings={} ) ->
			@add key, value for own key, value of mappings
	
		add: Function.switch [
			
			Type(Value,Value) Function.Chaining (key,value) -> @[key] = value
			Type(Object)	  Function.Chaining (mappings) -> @add(key,value) for own key, value of mappings
			
		]
	
		# Tests: full
		# Docs: none
		remove: Function.Chaining (key) -> delete @[key]
	
		get: (key) -> @[key]
		
		# Tests: full
		# Docs: none
		keys: -> new Set ( key for own key of this )
	
		each: (fn) -> fn(key,value) for own key, value of this
	
		ensure: Function.identity

		# Tests: full
		# Docs: none
		@To: (constructor) ->
			class extends this

				add: this::add.extend [
					
					Type(Value,Value) Function.Chaining (key,value) -> @[key] = @ensure value
					Type(Array)       Function.Chaining (keys) -> @add key, @ensure() for key in keys
					
				]

				ensure: Object.ensure constructor

		# Tests: full
		# Docs: none
		@Using: (combine) ->
			class extends this
				add: this::add.extend [
					Type(Value,Value) Function.Chaining (key,value) ->
						@[key] = if not @[key] then @ensure(value) else combine @ensure(value), @[key]
				]