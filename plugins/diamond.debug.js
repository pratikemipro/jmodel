/*
 *	Diamond Debug Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/diamond'], function (diamond) {
	
	'use strict';
	
	Object.extend(diamond.Context.prototype,{
		
		debug: function () {
			console[console.group ? 'group' : 'log']('Context: '+this.name);
			this.types.each(function (name,type) {
				console[console.group ? 'group' : 'log']('Context: '+name);
				type.objects.debug();
				if ( console.groupEnd ) { console.groupEnd(); }
			});
			if ( console.groupEnd ) { console.groupEnd(); }
		}
		
	});
	
	Object.extend(diamond.Entities.prototype,{
	
		debug: function () {
			var ids = this.map(function (entity) {
				return entity.primaryKeyField ? entity[entity.primaryKeyField]() : '-';
			}).join(', ');
			console.log(ids);
		}
		
	});
	
});