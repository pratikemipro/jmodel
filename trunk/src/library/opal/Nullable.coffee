##
## Opal JavaScript Library: Nullable
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	window.Nullable = (constructor) ->
		construct = Object.construct constructor
		(x) ->
			if arguments.length == 1 and x == null then null
			else construct arguments...