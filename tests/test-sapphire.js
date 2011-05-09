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
		
		deepEqual( testSet.get(), ['red','green'], "addition of non-duplicate objects" );
		deepEqual( testSet.add('blue').get(), ['red','green','blue'], "addition of non-duplicate succeeds" );
		deepEqual( testSet.add('green').get(), ['red','green','blue'], "addition of duplicate fails" );
		
		equal( testSet.length, 3, "addition manages length correct");
		
		testSet.add('purple');
		equal( testSet.added, 'purple', "'added' property set corrrectly");
		
		testSet.index(sapphire.identity);
		
		deepEqual(testSet.__index.__delegate, {red:'red',green:'green',blue:'blue',purple:'purple'}, "index correctly updated");
		
		equal( testSet.add('cyan'), testSet, "'add' method returns set");
		
	});
	
	test('remove', function () {
		
		var testSet = sapphire.set('red','green','blue').index(sapphire.identity);
		var removed = testSet.remove(function (candidate) { return candidate === 'red'; });
		
		deepEqual(testSet.get(), ['green','blue'], 'element removal works');
		deepEqual(removed.get(), ['red'], 'correct removed element returned');
		equal(testSet.length, 2, "element removal updates length correctly");
		deepEqual(testSet.__index.__delegate, {green:'green',blue:'blue'}, "index correctly updated");
		
		var removed2 = testSet.remove(function (candidate) { return candidate === 'purple'; });
	
		equal( removed2 instanceof sapphire.Set, true, "Set returned even when no elements removed");
	
	});
	
	test('sort', function () {
		
		var testSet = sapphire.set('red','green','blue'),
			ordering = function (a,b) {
				return    a < b ? -1
						: a > b ? 1
						: 0;
			};
			
		testSet.sort(ordering);
		
		deepEqual(testSet.get(),['blue','green','red'],'sorting works');
		equal(testSet.sort(ordering) instanceof sapphire.Set, true, "sort returns a set");
		
	});

});