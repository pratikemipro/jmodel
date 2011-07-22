/*
 *	jQuery Topaz Domain Binding Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/topaz','jmodel-plugins/jquery.emerald'], function (jQuery,topaz) {
	
	jQuery.fn.bindTo = function (object,field) {
		this.each(function (index,element) {
			var eventName = jQuery(element).is('select') ? 'change' : 'keyup';
			jQuery(this).event(eventName)
				.map(Object.path('target.value'))
				.subscribe({
					context: object,
					message: function (value) {
						this[field](value);
					}
				});
		});
		return this;
	};
	
});