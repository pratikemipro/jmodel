/*
 *	jQuery Emerald Events Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/emerald'], function (jQuery,emerald) {

	var disjoin = emerald.disjoin, Set = emerald.Set, event = emerald.event;

	jQuery.fn.event = function (name,options) {
		return disjoin(Set.fromArray(this.map(function (index,element) {
			return event.from(this,name,options);
		}).get()));
	};

	jQuery.fn.subscribe = function (descriptor) {
	    this.each(function (index,element) {
	        descriptor.event.subscribe(function () {
	            descriptor.message.apply(element,arguments);
	        });
	    });
	    return this;
	};
	
});