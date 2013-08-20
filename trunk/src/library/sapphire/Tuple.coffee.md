# Tuple

		
		window.Tuple = class Tuple
	
			@Of: Function.From([Function]) (constructors...) ->
				types = constructors.map (constructor) -> Object.ensure constructor
				class extends this
					constructor: (args...) ->
						this[index] = type(arg) for [type,arg], index in Array.zip types, args
						
