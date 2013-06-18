##
## Opal JavaScript Library: String
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	String.In = (strings...) ->
		@Where \
			(str) -> str in strings,
			"Invalid String: \"<value>\" is not in {#{( '\"'+string+'\"' for string in strings ).join(',')}}"

	String.Matching = (regex) ->
		@Where \
			(str) -> regex.test str,
			"Invalid String: \"<value>\" does not match #{regex.toString()}"