/*
 *	jQuery Emerald Events Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

jQuery.fn.event = function (name) {
    var events = [];
    this.each(function (index,element) {
        events.push(emerald.event.from(this,name));
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