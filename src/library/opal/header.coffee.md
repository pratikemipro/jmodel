	###
		Opal JavaScript Library
		http://code.google.com/p/jmodel/

		Copyright (c) 2009-2013 Richard Baker
		Dual licensed under the MIT and GPL licenses
	###
	
	define ->
	
		# NOTE: Define assert here
	
		window.Value = ->
		window.Value.equal = (x,y) -> x == y
		window.Value.valid = (x) -> x != undefined
		
		window.Scalar = ->
		window.Scalar.valid = (x) ->
			typeof x == 'number' \
			or typeof x == 'string' \
			or typeof x == 'boolean' \
			or x == null \
			or x instanceof Number \
			or x instanceof String \
			or x instanceof Boolean
		
		window.Not = (constructor) ->
			fn = ->
			valid = Object.isa constructor
			fn.valid = (x) -> x? and not valid x
			return fn
	
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
				
		window.PreconditionError = class extends Error
		
		window.PostconditionError = class extends Error
				
