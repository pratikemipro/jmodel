/*
 *	jQuery Emerald Events Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

jQuery.fn.event = function (name) {
	return emerald.event.from(this,name);
};