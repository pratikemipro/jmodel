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
		
	# Tests: full
	Array.hastypes = (types...) ->
		predicates = ( Object.isa(type) for type in types )
		(array) ->
			return false if array.length != predicates.length
			valid = true
			( valid = valid and predicates[i](x) ) for x, i in array
			valid