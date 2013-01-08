##
## Opal JavaScript Library: Number
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	Number.__predicate = Object.isa Number
	
	# Restrictions
	
	Number.LessThan = (max) ->
		@Where \
			Function.lt(max),
			"Invalid Value: <value> is not less than #{max}"
			
	Number.GreaterThan = (min) ->
		@Where \
			Function.gt(min),
			"Invalid Value: <value> is not greater than #{min}"
	
	Number.Between = (min,max) ->
		@Where \
			Function.between(min,max),
			"Invalid Value: <value> is not between #{min} and #{max}"
	
	window.Integer = Number.Where \
		(value) -> value == Math.round(value),
		"Invalid Value: <value> is not an integer"
	
	Number.Positive = Number.GreaterThan 0
	Number.Negative = Number.LessThan 0