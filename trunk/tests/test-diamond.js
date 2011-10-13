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
	
	module('EntityTypes');
	
	test('EntityTypes creation', function () {
		
		var context = new diamond.Context('test'),
			entityTypes = new diamond.EntityTypes(context);
			
		equals( entityTypes.context instanceof diamond.Context, true, 'Constructor sets context');
		equals( entityTypes instanceof diamond.TypedMap, true, 'EntityTypes is a TypedMap');
		equals( entityTypes.ensure({forename:String},{}) instanceof Function, true, 'ensure method returns a constructor' );
		
		var person = entityTypes.create('Person',{forename:String},{});
		
		equals( entityTypes.get('Person'), person, 'create method creates and returns an entity type');
		equals( person instanceof Function, true, 'Created entity type is a constructor');
		equals( person.options.name, 'Person', 'create method sets name from key correctly in options');
		
	});


});