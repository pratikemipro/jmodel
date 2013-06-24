##
## Opal JavaScript Library: Array
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	# Tests: full
	Array.concat = (arrays...) -> [].concat arrays...
	
	# Tests: full
	Array.zip = (arrays...) ->
		return [] if arrays.length == 0
		maxIndex = Math.min ( arr.length-1 for arr in arrays )...
		( arr[i] for arr in arrays for i in [0..maxIndex] )
	
	# Tests: full	
	Array.flatten = (array=[]) ->
		Array.concat ( ( if arr instanceof Array then Array.flatten(arr) else arr ) for arr in array )...
		
	# Tests: partial
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