# Array

		
		Array.concat = (arrays...) -> [].concat arrays...
		
		Array.map = (fn) -> (arr) -> arr.map fn
				
		Array.reduce = (reduction,initial) -> (array) -> array.reduce(reduction,initial or reduction.unit)
	
		Array.zip = (arrays...) ->
			maxIndex = Math.min ( arr.length-1 for arr in arrays )...
			return [] if maxIndex in [-1,Infinity]
			( arr[i] for arr in arrays for i in [0..maxIndex] )
			
		Array.zipWith = (fn) -> (arrays...) ->
			Array.zip(arrays...).map (arr) -> fn arr...
		
		Array.flatten = (array=[]) ->
			Array.concat ( ( if arr instanceof Array then Array.flatten(arr) else arr ) for arr in array )...
			
		Array.equal = (a,b) -> a.length == b.length and Array.reduce(Boolean.and) Array.zipWith(Value.equal) a, b
		
		Array::find = (predicate) ->
			for item in this
				return item if predicate.call item, item
				
		Array::each = (fn) ->
			for item in this
				fn.call item, item
		

## Predicates

		
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
			
		Array.all = (predicate) -> (array) -> Array.reduce(Boolean.and) array.map (x) -> predicate.call x, x
		
		Array::all = (predicate) -> Array.all(predicate) this
		
		Array.any = (predicate) -> (array) -> Array.reduce(Boolean.or) array.map (x) -> predicate.call x, x
		
		Array::any = (predicate) -> Array.any(predicate) this
		
		Array.none = (predicate) -> Array.any(predicate).not()
		
		Array::none = (predicate) -> Array.none(predicate) this	
		
		Array.ordered = (array) -> Array.reduce(Boolean.and) Array.zipWith(Value.lt) array, array[1..]
			
		Array::ordered = -> Array.ordered this
				

## Reductions

		
		Array.count = (predicate=Boolean.True) -> (acc=0,value) -> acc + if predicate.call(value,value) then 1 else 0
		Array.count.unit = 0
		
		Array::count = (predicate) -> @reduce Array.count(predicate), 0
		
		Array.contains = (predicate=Boolean.True) -> (acc=false,value) -> acc or predicate.call(value,value)
		Array.contains.unit = false
		
		Array::contains = (predicate) -> @reduce Array.contains(predicate), false
		
