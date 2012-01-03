define(['../library/sapphire.js'], function (sapphire) {


	//
	// Map construction
	//
	
	module('Map construction');
	
	test('Map constructor', function () {
	
		var map = new sapphire.Map({'red':1,'green':2,'blue':3});
		
		equals( map.get('green'), 2, 'Map constructor returns a functional Map');
		
	});
	
	test('Map.To', function () {
	
		var map = new (sapphire.Map.To(Date))({'rich':'1974-11-20'});
		
		equals( map instanceof sapphire.TypedMap, true, 'Map.To is constructor for TypedMap');
		equals( map.get('rich') instanceof Date, true, 'Elements have correct type');
		
	});
	
	module('Map.prototype');
	
	test('get', function () {
	
		var map = new sapphire.Map({'red':1,'green':2,'blue':3});
		
		equals( map.get('red'),  1, 'get works for first key');
		equals( map.get('blue'), 3, 'get works for last key');
		equals( map.get('pink'), undefined, 'get returns undefined for non-existent key');
		
		
	});
	
	test('add', function () {
	
		var map = new sapphire.Map();
		
		map.add('green',2);
		equals( map.get('green'), 2, 'add works for key/value pairs' );
		
		map.add({'red': 1,'blue': 3});
		deepEqual( [map.get('red'),map.get('green'),map.get('blue')], [1,2,3], 'add works for mapping object' );
		
		map.add(['purple','pink']);
		deepEqual( map.__rep__, {'red':1,'green':2,'blue':3,'purple':undefined,'pink':undefined}, 'add works for array of keys');
		
	});
	
	test('addMappings', function () {
	
		var map = new sapphire.Map({'green':1,'red':2});
		
		map.addMappings({'green': 2,'blue': 3});
		deepEqual( [map.get('red'),map.get('green'),map.get('blue')], [2,2,3], 'addMapping adds key/value mappings' );
		
	});
	
	test('addArray', function () {
		
		var map = new sapphire.Map();
		
		map.addArray(['red','green','blue']);
		
		deepEqual(Object.keys(map.__rep__),['red','green','blue'],'addArray adds correct keys');
		
	});
	
	test('add2', function () {
	
		var map = new sapphire.Map();
		
		map.add('green',2);
		map.add('blue','planet')
		map.add(3,'red');
		
		equal(map.get('green'),2,'add2 adds key/value pairs when key is string and value number');
		equal(map.get('blue'),'planet','add2 adds key/value pairs when key is string and value string');
		equal(map.get(3),'red','add2 adds key/value pairs when key is number and value string');
		
	});
	
	test('remove', function () {
		
	});


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
	
	test('concat', function () {
	
		var test1 = sapphire.Set.from('red','green','blue'),
			test2 = sapphire.Set.from('cyan','magenta','yellow');
			
		deepEqual(test1.concat(test2).get(), ['red','green','blue','cyan','magenta','yellow'], "concat returns concatenation of sets");
		deepEqual(test1.get(), ['red','green','blue','cyan','magenta','yellow'], "concat updates first argument");
		
		deepEqual(test1.concat().get(), ['red','green','blue','cyan','magenta','yellow'], "non-Set arguments not concatenated");
		
	});
	
	module('Pure methods');
	
	test('count', function () {
	
		var testSet = sapphire.set();
		equals(testSet.count(), 0, 'new sets are empty');
		
		testSet.add('red').add('green');
		equals(testSet.count(), 2, 'adding elements increments count');
		
		testSet.remove(sapphire.is('green'));
		equals(testSet.count(), 1, 'removing element decrements count');
		
		testSet.add(2).add('green').add(7).add('blue');
		equals(testSet.count(function (item) {return typeof item === 'number';}), 2, 'count works with predicates');
		
	});
	
	test('each', function () {
	
		var testSet = sapphire.set('red','green','blue');
		
		var val = '',
			concat = function (item) {val+=item},
			length = function (item) {return item.length;};
			
		testSet.each(concat);
		equals( val, 'redgreenblue', 'each works with single function');
		
		val = 0;
		testSet.each(length,concat);
		equals(val,12,'each works with implict pipe of functions');
		
	});
	
	test('partition', function () {
	
		var testSet = sapphire.set(1,2,3,4,5,6),
			partition = testSet.partition(function (item) { return item % 2 === 0; });
		
		equal(partition[true] instanceof sapphire.Set, true, 'True items contained in Set');
		equal(partition[false] instanceof sapphire.Set, true, 'False items contained in Set');
		
		deepEqual(partition[true].get(),[2,4,6],'True set contains correct items');
		deepEqual(partition[false].get(),[1,3,5],'False set contains correct items');
		
	});
	
	test('map', function () {
		
		var testSet = sapphire.set(1,2,3);
		
		deepEqual( testSet.map(function (x) {return 2*x;}).get(), [2,4,6], 'Mapping produces correct elements' );
		deepEqual( testSet.map(function (x) {return 2*x;}, function (x) {return x+1;}).get(), [3,5,7], 'Maping supports implicit piping' );
		equal( testSet.map(function (x) {return 2*x;}) instanceof sapphire.List, true, 'Mapping a set produces a List' );
		
	});
	
	test('reduce', function () {
		
		var testSet = sapphire.set(1,2,3);
		
		equal( testSet.reduce(sapphire.plus),   6, 'Reduction works when function has unit');
		equal( testSet.reduce(sapphire.plus,2), 8, 'Reduction works when initial accumulator provided explicitly');
		
	})

});