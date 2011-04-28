/*
 *	Emerald Keyboard Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/emerald'], function (emerald) {
	
	var codes = {
		':backspace': 	8,
		':tab': 		9,
		':return': 		13,
		':shift': 		16,
		':ctrl': 		17,
		':alt': 		18,
		':escape': 		27,
		':left': 		37,
		':up': 			38,
		':right': 		39,
		':down': 		40,
		':delete': 		46,
		':leftcmd': 	91,
		':rightcmd': 	93
	};
	
	function key (identifier) {
		
		function matchRegex (event) {
			return String.fromCharCode(event.which).toUpperCase().match(identifier) || false; 
		}
		
		if ( arguments.length > 1 ) {
			return emerald.or.apply(null,emerald.List.fromArguments(arguments).map(key).get());
		}
		else if ( identifier.test ) { // Regex
			return function (event) {
				return String.fromCharCode(event.which).toUpperCase().match(identifier) || false; 
			}
		}
		
		switch (typeof identifier) {
			
			case 'string':
				return identifier.length === 1 ? function (event) {
					return String.fromCharCode(event.which).toUpperCase() === identifier.toUpperCase();
				} : function (event) {
					return event.which === codes[identifier];
				};
				
			case 'number':
				return function (event) {
					return event.which === identifier;
				};
			
		}
		
	}
	
	emerald.extend({
		key: key
	});
	
});