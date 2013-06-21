##
## Emerald JavaScript Library: Event
## http://code.google.com/p/jmodel/
##
## Copyright (c) 2009-2013 Richard Baker
## Dual licensed under the MIT and GPL licenses
##

	codes =
		':backspace': 	8
		':tab': 		9
		':return': 		13
		':shift': 		16
		':ctrl': 		17
		':alt': 		18
		':escape': 		27
		':left': 		37
		':up': 			38
		':right': 		39
		':down': 		40
		':delete': 		46
		':leftcmd': 	91
		':rightcmd': 	93

	# Tests: none
	# Docs: none
	Event.key = (identifier,identifiers...) ->
		if arguments.length > 1
			Event.key(identifier).or Event.key identifiers...
		else if Object.isa(Regex) identifier
			({which}) -> String.fromCharCode(which).toUpperCase().match(identifier) or false
		else if Object.isa(Number) identifier
			({which}) -> which == identifier
		else if Object.isa(String)(identifier) and identifier.length > 1
			Event.key codes[identifier]
		else
			({which}) -> String.fromCharCode(which).toUpperCase() == identifier