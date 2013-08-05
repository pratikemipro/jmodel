# Array

		
		Array.concat = (arrays...) -> [].concat arrays...
		
		Array.map = (fn) -> (arr) -> arr.map fn
				
		Array.reduce = (reduction,initial) -> (array) -> array.reduce(reduction,initial or reduction.unit)
		
		Array.all = (predicate) -> (array) -> Array.reduce(Boolean.and) ( predicate x for x in array )
		
		Array::all = (predicate) -> Array.all(predicate) this
		
		Array.any = (predicate) -> (array) -> Array.reduce(Boolean.or) ( predicate x for x in array )
	
		Array::any = (predicate) -> Array.any(predicate) this
	
		Array.zip = (arrays...) ->
			maxIndex = Math.min ( arr.length-1 for arr in arrays )...
			return [] if maxIndex in [-1,Infinity]
			( arr[i] for arr in arrays for i in [0..maxIndex] )
		
		Array.flatten = (array=[]) ->
			Array.concat ( ( if arr instanceof Array then Array.flatten(arr) else arr ) for arr in array )...
		
		Array.hastypes = (types...) ->
			(array=[]) ->
				return true if types.length == 0 and array.length == 0
				types2 = types.slice 0
				array2 = array.slice 0
				value  = undefined
				while type = types2.shift()
					if type instanceof Array
						[type] = type
						while array2.length > 0 and Object.isa(type) array2[0]
							array2.shift()
					else
						value = array2.shift()
						return false if not Object.isa(type) value
				return types2.length == 0 and array2.length == 0
				
		Array::ordered = -> Array.reduce(Boolean.and) ( x < y for [x,y] in Array.zip this, this[1..] )
				
