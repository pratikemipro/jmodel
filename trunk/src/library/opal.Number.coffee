##
## Opal JavaScript Library: Number
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	Number.__predicate = Object.isa Number
	
	# Restrictions
	
	Number.LessThan = (max) ->
		Number.Where \
			Function.lt(max),
			"Invalid Value: <value> is not less than #{max}"
			
	Number.GreaterThan = (min) ->
		Number.Where \
			Function.gt(min),
			"Invalid Value: <value> is not greater than #{min}"
			
	Number.Positive = Number.GreaterThan 0
	Number.Negative = Number.LessThan 0
	
	Number.Between = (min,max) ->
		Number.Where \
			Function.between(min,max),
			"Invalid Value: <value> is not between #{min} and #{max}"