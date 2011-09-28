/*
 *	Topaz JSON Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/topaz'], function (topaz) {
	
	'use strict';
	
	Object.extend(topaz.Set.prototype, {
	
		toBareObject: function () {
			return this.map(Object.method('toBareObject')).get();
		},
		
		toJSON: function () {
			return JSON.stringify(this.toBareObject());
		}
		
	});
	
	Object.extend(topaz.ObservableObject.prototype, {
		
		toBareObject: function () {
			return topaz.Set.fromArray(this.fields).reduce(function (object,field) {
				return object.setProperty(
					field.field,
					  field.toJSON ? field.toJSON()
					: field.value.toJSON ? field.value.toJSON()
					: field.value
				);
			}, new topaz.EnhancedObject() );
		},
		
		toJSON: function () {
			return JSON.stringify(this.toBareObject());
		}
		
	});
	
});