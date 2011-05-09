define(['../sapphire.js'], function (sapphire) {

	//
	// Set construction
	//
	
	module('Set construction');
	
	test('Set constructor', function () {
	   
	   var set = new sapphire.Set(['red','green','blue']);
	   
		equals( set.count(), 3, 'Set returns a set with correct cardinality');
		equals( set.first(), 'red', 'Set returns a set that has correct first element');
		deepEqual( set.get(), ['red','green','blue'], 'Set contains correct elements');
	    
	});
	
	test('Set.from', function () {
	
		var set = sapphire.Set.from('red','green','blue');
		
		equals( set instanceof sapphire.Set, true, 'Set.from returns a set');
		deepEqual( set.get(), ['red','green','blue'], 'Set.from produces set with correct elements');
		
	});
	
	test('Set.fromArray', function () {
	    
	    var set = sapphire.Set.fromArray(['red','green','blue']);
	    
	    equals( set instanceof sapphire.Set, true, 'Set.fromArray returns a set');
	    deepEqual( set.get(), ['red','green','blue'], 'Set.fromArray produces set with correct elements');
	    
	});
	
	test('Set.fromArguments', function () {
	   
	   function makeSet () {
	       return sapphire.Set.fromArguments(arguments);
	   }
	   
	   var set = makeSet('red','green','blue');
	   
	   equals( set instanceof sapphire.Set, true, 'Set.fromArguments returns a set');
	   equals( set.count(), 3, 'Set.fromArguments returns a set with correct cardinality');
	   equals( set.first(), 'red', 'Set.fromArguments has correct first element');
	    
	});
	
	test('set', function () {
		
		equals( sapphire.set(['red','green','blue']).count(), 3, "creation from array" );
		equals( sapphire.set('red','green','blue').count(), 3, "creation from arguments" );
		
	});
	
	
	//
	// Set mutators
	//
	
	module('Set mutators');
	
	test('add', function () {
		
		var testSet = sapphire.set();
		testSet.add('red');
		testSet.add('green');
		
		equals( testSet.count(), 2, "addition of non-duplicate objects" );
		equals( testSet.add('blue').count(), 3, "addition of non-duplicate succeeds" );
		equals( testSet.add('green').count(), 3, "addition of duplicate fails" );
		
		// NOTE: Test constraints here
		// NOTE: Test that ".added" is set correctly
		// NOTE: text that index is updated correctly
		
	});
	
	test('remove', function () {
		var testSet = sapphire.set('red','green','blue');
		var removed = testSet.remove(function (candidate) { return candidate === 'red'; });
		equals(testSet.first(), 'green', 'element removal works');
		equals(removed.first(), 'red', 'correct removed element returned');
		// NOTE: Test that length is managed correctly
		// NOTE: text that index is updated correctly
	});
	
	test('sort', function () {
		
		var testSet = sapphire.set('red','green','blue');
		testSet.sort(function (a,b) {
			return    a < b ? -1
					: a > b ? 1
					: 0;
		});
		
		equals(testSet.first(),'blue','sorting works');
		
	});

});