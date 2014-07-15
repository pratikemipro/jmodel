/*
 *	jQuery Emerald Events Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2013 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/emerald'], function (jQuery,emerald) {

	var disjoin = emerald.disjoin, Set = emerald.Set, event = emerald.event;
	
	jQuery.union = function () {
		elements = [].concat.apply([],Array.prototype.slice.call(arguments).map(function (x) {
			return x.get();
		}));
		$_ = $();
		return $_.add.apply($_,elements);
	}

	jQuery.fn.event = function () {
		
		var generator = typeof arguments[1] === 'string' ? event.fromDelegate : event.from,
			args = Array.prototype.slice.call(arguments);
			
		return disjoin(Set.fromArray(this.map(function (index,element) {
			return generator.apply(this,[this].concat(args));
		}).get()));
		
	};

	jQuery.fn.subscribe = function (subscriptions) {
		for ( var event in subscriptions ) {
			if ( subscriptions.hasOwnProperty(event) ) {
				this.event(event).subscribe(subscriptions[event]);
			}
		}
	}
	
});