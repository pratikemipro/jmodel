/*
 *	Diamond OData Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2011 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

define(['jmodel/diamond'], function (diamond) {
	
	'use strict';
	
	Object.extend(diamond.Context.prototype,{
		serviceLocation: ''
	});
	
	Object.extend(diamond.Entity.prototype,{
		
		persist: function () {
			console.log('Persisting...');
		}
		
	});
	
});