/*
 *	Opal Formatting Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

(function () {
	
	function Prepend (prefix) {
		return function _prepend (string) {
			return prefix+string;
		};
	}
	
	function Append (suffix) {
		return function _append (string) {
			return string+suffix;
		};
	}
	
	function Join (separator) {
		return opal.Method('join',separator);
	}
	
	function Concatenate () {
		var formatters = opal.arrayFromArguments(arguments),
			separator = ' ';
		if ( typeof formatters[formatters.length-1] == 'string' ) {
			separator = formatters.pop();
		}
		return function _concatenate (object) {
			var mapped = [];
			for (var i=0; i<formatters.length; i++) {
				mapped.push(formatters[i](object));
			}
			return mapped.join(separator);
		};
	}
	
	function Replace (find,replace) {
		replace = arguments.length == 2 ? replace
					: opal.pipe.apply(null,opal.arrayFromArguments(arguments).slice(1));
		return opal.Method('replace',find,replace);
	}
	
	function Surround (affix) {
		return compose(Prepend(affix),Append(affix));
	}
	
	function Decimal (places) {
		return opal.Method('toFixed',places);
	}
	
	function Locale () {
		return opal.Method('toLocaleString');
	}
	
	function Percentage () {
		return Append('%');
	}
	
	function Currency (symbol,decimals) {
		return function _currency (number) {
			return compose(	Prepend(number < 0 ? '-' : ''),
							Prepend(symbol),
							Locale(),
							Decimal(decimals===false ? 0 : 2) 		)(Math.abs(number));
		};
	}
	
	function Listing () {
		var formatter, terminal;
		if ( typeof arguments[0] == 'function' ) {
			formatter	= arguments[0];
			terminal	= arguments[1];
		}
		else {
			formatter 	= NoFormat;
			terminal	= arguments[0];
		}
		terminal = terminal || ' and ';
		return function _listing (list) {
			var length = list.count(),
				terminalPosition = length > 1 ? length-1 : -1,
				index=0;
			return list.reduce(function __listing (acc,object) {
				var separator = index == terminalPosition ? terminal : ', ';	
				index++;			
				return acc + (acc ? separator : '') + formatter(object);
			},'');
		};
	}
	
	opal.extend({
		prepend: 	Prepend,
		append: 	Append,
		join: 		Join,
		concat: 	Concatenate,
		replace: 	Replace,
		surround: 	Surround,
		decimal: 	Decimal,
		locale: 	Locale(),
		percent: 	Percentage(),
		currency: 	Currency,
		listing: 	Listing
	});
	
})();