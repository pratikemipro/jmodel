/*
 *	Emerald Keyboard Plugin v0.2.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/emerald'], function (emerald) {
	
	var _slice = Array.prototype.slice,
		codes = {
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
	
	function _regex (identifier) {
		return function (event) {
			return String.fromCharCode(event.which).toUpperCase().match(identifier) || false; 
		};
	}
	
	function _number (identifier) {
		return function (event) {
			return event.which === identifier;
		};
	}
	
	function _char (identifier) {
		var identifier = identifier.toUpperCase();
		return function (event) {
			return String.fromCharCode(event.which).toUpperCase() === identifier;
		}
	}
	
	function key (identifier) {
		return 	  arguments.length > 1 ? key(identifier).or(key.apply(null,_slice.call(arguments,1)))
				: identifier.test ? _regex(identifier)
				: typeof identifier === 'number' ? _number(identifier)
				: typeof identifier === 'string' && identifier.length > 1 ? _number(codes[identifier])
				: _char(identifier);
	}
	
	Object.extend(emerald, {
		key: key
	});
	
});