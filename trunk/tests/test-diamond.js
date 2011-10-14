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
	
	module('EntityType');
	
	test('EntityType creation', function () {
	
		var context = new diamond.Context('test'),
			entityType = diamond.EntityType(context,{
				person_id: diamond.PrimaryKey(Number),
				forename: String
			},{
				name: 'Person',
				instance: {
					test: 'test'
				}
			});
			
		equals( entityType instanceof Function, true, 'entityType is a constructor');
		equals( entityType.prototype instanceof diamond.Entity, true, 'entityType has Entity as prototype');
		equals( entityType.prototype.test, 'test', 'instance properties are applied to prototype');
		equals( entityType.displayName, 'Person', 'displayName set correctly');
		equals( entityType.objects instanceof diamond.Entities, true, 'Objects collection created');
		equals( entityType.deleted instanceof diamond.Entities, true, 'Deleted objects collection created');
		
	});
	
	test('Entity creation', function () {
	
		var context = new diamond.Context('test'),
			Person = diamond.EntityType(context,{
				person_id: diamond.PrimaryKey(Number),
				forename: String
			},{
				name: 'Person'
			}),
			entity = new Person({forename:'fred'}),
			entity2 = new Person({forename:'jane'}),
			entity3 = new Person({person_id:3,forename:'john'});
			
		equals(entity instanceof Person, true, 'Entity is an instance of its type');
		equals(entity instanceof diamond.Entity, true, 'Entity is an instance of Entity');
		
		equals(entity.person_id(), -1, 'Primary key is set correctly');
		equals(entity2.person_id(), -2, 'Primary key is incremented correctly');
		
		equals(entity.forename(), 'fred', 'Properties are set correctly');
		equals(entity.primaryKeyField, 'person_id', 'primaryKeyField is set correctly');
		equals(entity.entityType.displayName, 'Person', 'entityType is set correctly');
		
		equals(entity.dirty, true, 'Entities with generated keys start dirty');
		equals(entity3.dirty, false, 'Entities without keys start clean');
		entity3.forename('james');
		equals(entity3.dirty, true, 'Changes to entities make them dirty');
		
		equals(Person.objects.length, 3, 'Count of entities is correct');
		equals(Person.objects.get(-2).forename(), 'jane', 'Entities can be retrieved from objects collection');
		
		entity.person_id(5);
		equals(Person.objects.get(5).forename(),'fred','Index updated when primary key value changes');
		
	});


});