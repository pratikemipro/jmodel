##
## Opal JavaScript Library: Maybe
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Maybe = (base) ->
		
		construct = Object.construct base
		valid     = Object.isa base
		
		derived       = (x) -> if arguments.length == 0 or not x? then undefined else construct arguments...
		derived.valid = (x) -> not x? or valid x
		
		return derived