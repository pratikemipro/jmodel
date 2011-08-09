/*
 *	jQuery Topaz Domain Binding Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jquery','jmodel/topaz','jmodel-plugins/jquery.emerald'], function (jQuery,topaz) {
	
	jQuery.fn.bindTo = function (object,binding,formatter) {
		
		formatter = formatter || Function.identity;
		
		if ( typeof binding === 'object' ) { // Multiple bindings
			for (var selector in binding) {
				if ( binding.hasOwnProperty(selector) ) {
					var field = binding[selector];
					jQuery(this).find(selector).bindTo(object,field);
				}
			}
		}
		else { // Single binding
			
			// Bind from DOM to model
			this.filter(':input').each(function (index,element) {
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
			
			// Bind from model to non-input DOM element
			this.filter(':not(:input)').each(function (index,element) {
				object.event(binding)
					.subscribe({
						context: jQuery(this),
						message: function (value) {
							this.html(formatter(value));
						}
					});
			});
			
		}

		return this;
		
	};
	
});