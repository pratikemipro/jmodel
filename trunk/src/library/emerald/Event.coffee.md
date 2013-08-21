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
		
		Character = String.Where -> @length == 1
		SpecialKey = String.Matching /:.+/
		
		# Tests: none
		# Docs: none
		Event.key = Function.overload [
		
			Function.From(Character)     (key) -> ({which}) -> String.fromCharCode(which).toUpperCase() == key
		
			Function.From(RegExp)        (regex) -> ({which}) -> String.fromCharCode(which).toUpperCase().match(regex) or false
		
			Function.From(Number)        (number) -> ({which}) -> which == number
		
			Function.From(SpecialKey)    (identifier) -> Event.key codes[identifier]
		
			Function.From(Value,[Value]) (identifer,identifiers...) -> Event.key(identifier).or Event.key identifiers...
		
		]