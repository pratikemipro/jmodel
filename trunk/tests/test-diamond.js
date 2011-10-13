define(['../library/diamond.js'], function (diamond) {


	//
	// Map construction
	//
	
	module('Context');
	
	test('Context creation', function () {
	
		var context = new diamond.Context('test');
		
		equals( context.isDefault, false, 'Constructor does not create default context');
		equals( context.name, 'test', 'Constructor sets name correctly');
		equals( context.types instanceof diamond.EntityTypes, true, 'Constructor creates EntityTypes collection');
		equals( context.events instanceof diamond.EventRegistry, true, 'Constructotr creates EventRegistry');
		equals( context.event('beginInitialisation') instanceof diamond.EventType, true, 'Constructor creates beginInitialisation event type');
		equals( context.event('endInitialisation') instanceof diamond.EventType, true, 'Constructor creates endInitialisation event type');
		
	});


});