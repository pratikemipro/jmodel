##
## Opal JavaScript Library: String
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	String.__predicate = Object.isa String

	String.In = (strings...) ->
		cons = (str) -> if cons.__predicate(str) then str else throw "Invalid String: \"#{str}\" is not in {#{( '\"'+string+'\"' for string in strings ).join(',')}}"
		cons.__predicate = (str) -> String.__predicate(str) and str in strings
		return cons

	String.Matching = (regex) ->
		cons = (str) -> if cons.__predicate(str) then str else throw "Invalid String: \"#{str}\" does not match #{regex.toString()}"
		cons.__predicate = (str) -> String.__predicate(str) and regex.test str
		return cons