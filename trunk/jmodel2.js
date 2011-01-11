/*
 *	jModel Javascript Library v2.0.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2009-2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *	Requires opal.js and emerald.js
 *
 */

var jModel = (function () {
	
	
	var external	= _,
		nextKey		= -1; // NOTE: make this nicer
	
	
	//
	// Import Emerald
	//
	
	for ( var i in emerald ) {
		eval('var '+i+' = emerald.'+i);
		external[i] = emerald[i];
	}
	
	
	//
	// EntityType
	//
	
	function EntityType (fields,options) {
		
		var entityType = function (data) {
			ObservableObject.call(this,fields,options);
			this.set(data);
			entityType.objects.add(this);
		};
		
		entityType.constructor	= entityType;
		entityType.prototype	= new ObservableObject();
		entityType.objects		= new EntitySet(entityType);
		entityType.find			= delegateTo(entityType.objects,'filter');
		
		return entityType;
		
	}
	
	external.EntityType = EntityType;
	
	
	//
	// EntitySet
	//
	
	function EntitySet (constructor) {
		TypedSet.call(this,constructor);
	}
	
	EntitySet.prototype = extend({
		
		constructor: EntitySet,
		
		create: function (data) {
			return this.__construct(data);
		}
		
	}, new TypedSet() );
	
	
	//
	// Primary Key
	//
	
	function key (options) {
		options = ( typeof options === 'object' ) ? options : {defaultValue:options};
		return function (object,field,entity_set) {
			var field		= new IntegerField(object,field,options),
				constraint 	= new PrimaryKeyConstraint(field,entity_set);
			return field;
		};
	}
	
	external.key = key;
	
	
	//
	// PrimaryKeyConstraint
	//
	
	function PrimaryKeyConstraint (field,entity_set) {
		
		if ( field.get() === null || typeof field.get() === 'undefined' ) {
			field.set(nextKey--);
		}
		
		field.event.subscribe(function (value) {
			if ( value === null || typeof value === 'undefined' ) {
				field.set(nextKey--);
			}
		});
		
	}
	
	
	return external;
	
	
})();


if (_ && _.opal_version) {
	var _ = jModel;
}