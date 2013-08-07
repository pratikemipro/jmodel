# Type

		
		window.Type = Type = ->
		
		Type.union = Function.From(Object).Returning(-> class) \
			(type) -> (subtypes={}) ->
				for name, constructor of subtypes
					do (name,constructor) ->
						type[name] = class extends type
							constructor: constructor
						
