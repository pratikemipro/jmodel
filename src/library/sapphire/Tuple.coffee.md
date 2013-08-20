# Tuple

		
		window.Tuple = class Tuple
			
			@equal: Function.From(Tuple,Tuple) ([a...],[b...]) -> Array.equal a, b
	
			@Of: Function.From([Function]) (constructors...) ->
				types = constructors.map (constructor) -> Object.ensure constructor
				class extends this
					constructor: (args...) ->
						Array::push.call this, type arg for [type,arg] in Array.zip types, args
						
