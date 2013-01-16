##
## Opal JavaScript Library: Object
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	# NOTE: Need special handling for date here
	Object.construct = (constructor,args1...) ->
		if constructor in [Number,String,Boolean] then constructor
		else (args2...) ->
			args = Array.concat args1, args2
			new constructor args...

	Object.isa = (constructor) ->
		if      constructor == Number  then (obj) -> obj instanceof Number or typeof obj == 'number'
		else if constructor == String  then (obj) -> obj instanceof String or typeof obj == 'string'
		else if constructor == Boolean then (obj) -> obj instanceof Boolean or typeof obj == 'boolean'
		else                                (obj) -> obj instanceof constructor