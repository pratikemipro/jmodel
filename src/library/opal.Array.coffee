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
		switch arrays.length
			when 0 then []
			when 1 then arrays[0]
			else
				maxIndex = Math.min ( arr.length-1 for arr in arrays )...
				( arr[i] for arr in arrays for i in [0..maxIndex] )
		
	Array.flatten = (array) ->
		Array.concat ( if arr instanceof Array then Array.flatten(arr) else arr for arr in array )...