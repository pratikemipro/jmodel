/*
 *	Emerald Keyboard Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

(function () {
	
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
		':leftcmd': 	91,
		':rightcmd': 	93
	};
	
	function key (identifier) {
		
		if ( arguments.length > 1 ) {
			return emerald.Or.apply(null,emerald.List.fromArguments(arguments).map(key).get());
		}
		
		switch (typeof identifier) {
			
			case 'string':
				return identifier.length === 1 ? function (event) {
					return String.fromCharCode(event.which) === identifier.toUpperCase();
				} : function (event) {
					return event.which === codes[identifier];
				};
				
			case 'number':
				return function (event) {
					return event.which === identifier;
				};
				
			case 'function':
				return function (event) {
					return String.fromCharCode(event.which).match(identifier) || false; 
				}
				
			case 'object':
				return emerald.Or.apply(null,emerald.List.fromArray(identifier).map(key).get());
			
		}
		
	}
	
	emerald.extend({
		key: key
	});
	
})();