# Type

		
		window.Type = Type = (constructor) ->
			(fn) -> fn.extend
				matches: Object.isa constructor
		
		Type.union = Function.From(Function).Returning(-> class) \
			(type) -> (fn) ->
			
				subtype = (constructor) -> class extends type
					constructor: ( constructor or -> )
					
				subtypes = fn.call type
				
				if subtypes instanceof Array
					for name in subtypes
						do (name) -> type[name] = subtype ->
				else
					for name, constructor of fn.call type
						do (name,constructor) -> type[name] = subtype constructor 
		
