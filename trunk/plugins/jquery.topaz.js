/*
 *	jQuery Topaz Domain Binding Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/topaz','jmodel-plugins/jquery.emerald'], function (jQuery,topaz) {
	
	jQuery.fn.bindTo = function (object,binding) {
		
		if ( typeof binding === 'object' ) { // Multiple bindings
			for (var selector in binding) {
				if ( binding.hasOwnProperty(selector) ) {
					var field = binding[selector];
					jQuery(this).find(selector).bindTo(object,field);
				}
			}
		}
		else { // Single binding
			this.each(function (index,element) {
				var eventName = jQuery(element).is('select') ? 'change' : 'keyup';
				jQuery(this).event(eventName)
					.map(Object.path('target.value'))
					.subscribe({
						context: object,
						message: function (value) {
							this[binding](value);
						}
					});
			});
		}

		return this;
		
	};
	
});