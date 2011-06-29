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
			console.group('Context: '+this.name);
			this.types.each(function (name,type) {
				console.group(name);
				type.objects.debug()
				console.groupEnd();
			});
			console.groupEnd();
		}
		
	});
	
	Object.extend(diamond.Entities.prototype,{
	
		debug: function () {
			console.log(this.count());
		}
		
	});
	
});