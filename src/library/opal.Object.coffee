##
## Opal JavaScript Library: Object
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	Object.isa = (constructor) ->
		if constructor == Number then (obj) -> obj instanceof Number or typeof obj = 'number'
		else if constructor == String then (obj) -> obj instanceof String or typeof obj = 'string'
		else (obj) -> obj instanceof Constructor