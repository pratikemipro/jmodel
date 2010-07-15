/*
 *	Opal Async Plugin v0.1.1
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

(function () {
	
	// Tests: none
	function sequence () {
		var operations	= Array.prototype.slice.call(arguments),
			operation	= operations.shift(),
			callback	= operations.shift();
		function makeCallback () {
			return function _callback () {
				callback.apply(null,arguments);
				operation = operations.shift();
				callback = operations.shift();
				if ( operation && callback ) {
					performOperation();
				}
			};
		}
		function performOperation () {
			operation(makeCallback());
		}
		return performOperation();
	}
	
	// Tests: none
	function synchronise () {
		var args = Array.prototype.slice.call(arguments),
			last = args.pop(),
			left = args.length/2;
		while ( args.length > 0 ) {
			(function () {
				var operation = args.shift(), callback = args.shift();
				operation(function () {
					callback.apply(null,arguments);
					left--;
					if ( left === 0 ) {
						last();
					}
				});
			})();	
		}
	}
	
	opal.extend({
		sequence: sequence,
		synchronise: synchronise,
		synchronize: synchronise
	})
	
})();