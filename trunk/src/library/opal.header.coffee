###
	Opal JavaScript Library
	http://code.google.com/p/jmodel/

	Copyright (c) 2009-2013 Richard Baker
	Dual licensed under the MIT and GPL licenses
###

define ->
	
	# NOTE: Define assert here
	
	window.Value = ->
	window.Value.valid = (x) -> x != undefined
	
	# Tests: none
	Object.isa = (constructor) ->
		if      constructor == Number  then (obj) -> obj instanceof Number or typeof obj == 'number'
		else if constructor == String  then (obj) -> obj instanceof String or typeof obj == 'string'
		else if constructor == Boolean then (obj) -> obj instanceof Boolean or typeof obj == 'boolean'
		else if constructor == Value   then (obj) -> obj != undefined
		else if constructor.valid?     then (obj) -> constructor.valid obj
		else                                (obj) -> obj instanceof constructor