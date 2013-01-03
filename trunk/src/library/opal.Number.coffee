##
## Opal JavaScript Library: Number
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	Number.__predicate = Object.isa Number
	
	Number.Between = (min,max) ->
		cons = (num) -> if cons.__predicate(num) then num else throw "Invalid Number: #{num} is not between #{min} and #{max}"	
		cons.__predicate = (num) -> Number.__predicate(num) and min <= num <= max
		return cons