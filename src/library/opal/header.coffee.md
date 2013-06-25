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
		Object.isa = (constructor) -> switch
	
			when constructor == Number
				(obj) -> obj instanceof Number or typeof obj == 'number'
		
			when constructor == String
				(obj) -> obj instanceof String or typeof obj == 'string'
		
			when constructor == Boolean
				(obj) -> obj instanceof Boolean or typeof obj == 'boolean'
		
			when constructor == Value
				(obj) -> obj != undefined
		
			when constructor.valid?
				(obj) -> constructor.valid obj
		
			else
				(obj) -> obj instanceof constructor