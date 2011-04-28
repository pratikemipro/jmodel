/*
 *	jQuery Emerald Events Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/emerald'], function (jQuery,emerald) {

	jQuery.fn.event = function (name,options) {
	    var events = [];
	    this.each(function (index,element) {
	        events.push(emerald.event.from(this,name,options));
	    });
		return emerald.disjoin.apply(this,events);
	};


	jQuery.fn.subscribe = function (descriptor) {
	    this.each(function (index,element) {
	        descriptor.event.subscribe(function () {
	            descriptor.message.apply(element,arguments);
	        })
	    });
	    return this;
	}
	
});