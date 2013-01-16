##
## Opal JavaScript Library: Array
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	Array.concat = (arrays...) -> [].concat arrays...
	
	Array.zip = (arrays...) ->
		maxIndex = Math.min ( arr.length-1 for arr in arrays )...
		( arr[i] for arr in arrays for i in [0..maxIndex] )