/*
 *	Diamond OData Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define([

	'jmodel/diamond',
	'jquery',
	'jmodel-plugins/topaz.json'

], function (diamond,$) {
	
	'use strict';
	
	Array.fromOData = function (odata,expand) {
		expand = typeof expand !== 'undefined' ? expand : false;
		var entity = odata.d ? odata.d : odata,
			obj = [];
		for ( var i in entity ) {
			obj.push(Object.fromOData(entity[i],expand));
		}
		return obj;
	};
	
	Date.fromOData = function (odata) {
		return Date.create(parseInt(odata.substring(6),10));
	};
	
	Object.fromODataUri = function (uri) {
		var obj;
		$.ajax({
			url: uri,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json',
			async: false,
			success: function (data) {
				obj = Object.fromOData(data,false);
			}
		});
		return obj;
	};
	
	Object.fromOData = function (odata,expand) {
	
		expand = typeof expand !== 'undefined' ? expand : false;
	
		var entity = odata.d ? odata.d : odata,
			obj;

		if ( entity instanceof Array ) {
			return Array.fromOData(odata,expand);
		}
		else {

			obj = {};

			// Process fields
			for ( var field in entity ) {

				var value = entity[field];
				
				// Unless the field is metadata or a deferred value that should not be epanded
				if ( field !== '__metadata' && field !== '__proto__' && ( !(value && value.__deferred) || expand ) ) {
					
					obj[field] =   typeof value === 'string' && value.substring(1,5) === 'Date' ? Date.fromOData(value)
								 : value && value.__deferred ? Object.fromODataUri(value.__deferred.uri)
								 : typeof value === 'object' && value !== null ?  Object.fromOData(value,expand)
								 : value;
					
				}
				
			}

		}

		return obj;
		
	};
	
	Object.extend(diamond.Context.prototype,{
		serviceLocation: ''
	});
	
	Object.extend(diamond.plugin.type, {
	
		persist: function () {
			this.objects.persist();
			this.deleted.persist();
		}
		
	});
	
	Object.extend(diamond.Entity.prototype, {
		
		persist: function (completionEvent) {
	
			if ( !this.dirty ) { return this; }
			
			var id = this.primaryKeyField ? this[this.primaryKeyField]() : undefined;

			diamond.event.fromAjax({
				url: this.context.serviceLocation+'/'+(this.entityType.options.entitySet || this.entityType.options.plural || this.entityType.typeName+'s')+(id > 0 ? '('+id+')' : ''),
				type: 	id > 0 && !this.deleted ? 'MERGE'
					  : id > 0 && this.deleted ? 'DELETE'
					  : 'POST',
				data: JSON.stringify(this.toBareObject().removeProperties(this.key)),
				contentType: 'application/json',
				dataType: 'json'
			})
			.subscribe({
				context: this,
				message: function (json) {
					this.dirty = false;
					if ( json ) {
						var object = Object.fromOData(json);
						this[this.primaryKeyField](object[this.primaryKeyField]);
					}
					if ( completionEvent instanceof diamond.EventType ) {
						completionEvent.raise();
					}
				},
				error: function () {
					if ( completionEvent instanceof diamond.EventType ) {
						completionEvent.fail.apply(completionEvent,arguments);
					}
				}
			});
			
			return this;
			
		}
		
	});
	
	Object.extend(diamond.Entities.prototype, {
	
		persist: function () {
			this.each(Object.method('persist'));
		}
		
	});
	
});