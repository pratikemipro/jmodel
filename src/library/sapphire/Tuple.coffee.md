# Tuple

		
		window.Tuple = class Tuple
		
			constuctor: (args...) -> Array::push.call this, arg for arg in args
			
			@equal: Function.From(Tuple,Tuple) ([a...],[b...]) -> Array.equal a, b
	
			@Of: Function.Cache.From([Function]).To(Function) (constructors...) ->
				types = constructors.map (constructor) -> Object.ensure constructor
				class extends this
					constructor: (args...) ->
						Array::push.call this, type arg for [type,arg] in Array.zip types, args
						
