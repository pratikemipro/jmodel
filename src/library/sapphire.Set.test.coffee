	module 'Set'
	
	test 'Set constructor', ->
		
		colours = new Set ['red','green','blue']
		
		equals colours.length, 3, 'Set returns a set with correct cardinality'
		deepEqual ( colour for colour in colours ), ['red','green','blue'], 'Set contains correct elements'
		
		numbers = new Set 1, 2 ,3
		
		deepEqual ( number for number in numbers ), [1,2,3], 'Constructor can be called on bare values'
		
	test 'Set::add', ->
		
		colours= new Set ['red','green','blue']
		
		colours.add('cyan').add('magenta').add('yellow')
		
		deepEqual ( colour for colour in colours), ['red','green','blue','cyan','magenta','yellow'], 'Adds elements and can be chained'
		
		colours.add('cyan').add('magenta').add('yellow')
		
		deepEqual ( colour for colour in colours ), ['red','green','blue','cyan','magenta','yellow'], 'Does not add elements more than once'
		
	test 'Set::remove', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		even = (x) -> x % 2 == 0
		
		removed = numbers.remove even
		
		deepEqual ( number for number in numbers ).sort(), [1,3,5,7], 'Leaves correct elements in set'
		deepEqual ( number for number in removed ).sort(), [2,4,6,8], 'Removes correct elements'
		
		equals removed instanceof Set, true, 'Removed elements returned as Set'
	
	test 'Set::replace', ->
		
		colours = new Set ['red','green','blue']
		
		colours.replace('green','cyan')
		
		deepEqual ( colour for colour in colours ), ['red','cyan','blue'], 'Replaces matched element'
		
		colours.replace('purple','magenta')
		
		deepEqual ( colour for colour in colours ), ['red','cyan','blue'], 'Does nothing if element not matched'
		
	test 'Set::member', ->
		
		colours = new Set ['red','green','blue']
		
		equals colours.member('red'), true, 'Returns true if test element is a member'
		equals colours.member('cyan'), false, 'Returns false if test element is not a member'
		equals colours.member(), false, 'Returns false if called without an argument'
	
	test 'Set::count', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		equals numbers.count(), 8, 'Returns cardinality of set when called without a predicate'
		equals numbers.count((x) -> x % 2 == 0), 4, 'Returns number of elements matching predicate when called with predicate'
		
	test 'Set::where', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		evens = numbers.where (x) -> x % 2 == 0
		
		deepEqual ( number for number in evens ), [2,4,6,8], 'Filters according to criteria'
		deepEqual ( number for number in numbers), [1,2,3,4,5,6,7,8], 'Leaves original set unchanged'
		
		equals evens instanceof Set, true, 'Returns a Set'
		raises (-> numbers.where 'red'), 'Raises an exception if argument is not a function'
		
	test 'Set::each', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		output  = []
		
		numbers.each (x) -> output.push x
		
		deepEqual output, [1,2,3,4,5,6,7,8], 'Function is called for each element of set'
		
	test 'Set::partition', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		even = (x) -> x % 2 == 0
		
		key = (x) -> if even x then 'even' else 'odd'
		
		partition = numbers.partition key
		
		deepEqual ( number for number in partition.get 'even' ).sort(), [2,4,6,8], 'Produces correct value for key'
		
		equals partition instanceof Map, true, 'Returns a Map'
		raises (-> numbers.partition 'red' ), 'Raises an exception if argument not a function'
		
	test 'Set::to', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		even = even = (x) -> x % 2 == 0
		
		list = numbers.to(List)
	
		equals list instanceof List, true, 'Casts to correct type'
		deepEqual ( number for number in list ), [1,2,3,4,5,6,7,8], 'Constructor is passed correct elements'
		
		raises (-> numbers.to 'red'), 'Raises an exception if not called with a function'
		
	test 'Set.subset', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		odds    = new Set [1,3,5,7]
		empty   = new Set []
		
		equals Set.subset(numbers,numbers), true, 'A set is a subset of itself'
		equals Set.subset(empty,numbers), true, 'The empty set is a subset of all sets'
		equals Set.subset(odds,numbers), true, 'Returns true when first is subset of second'
		equals Set.subset(numbers,odds), false, 'Returns false when first is not subset of second'
		
		raises (-> Set.subset 1, numbers ), 'Raises an exception if first argument not a Set'
		raises (-> Set.subset odds, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.equal', ->
		
		numbers   = new Set [7,5,3,1]
		odds      = new Set [1,3,5,7]
		evens     = new Set [2,4,6,8]
		more_odds = new Set [1,3,5,7,9]
		
		equals Set.equal(numbers,numbers), true, 'A set is equal to itself'
		equals Set.equal(numbers,odds), true, 'Two sets with the same elements are equal'
		equals Set.equal(odds,evens), false, 'Two sets with the same cardinality but different elements are not equal'
		equals Set.equal(odds,more_odds), false, 'Two sets with different numbers of elements are not equal' 
		
		raises (-> Set.equal 1, numbers ), 'Raises an exception if first argument not a Set'
		raises (-> Set.equal numbers, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.union', ->
		
		odds  = new Set [1,3,5,7]
		evens = new Set [2,4,6,8]
		zero  = new Set [0]
		
		union = Set.union odds, evens, zero
	
		deepEqual ( number for number in union ).sort(), [0,1,2,3,4,5,6,7,8], 'Union contains correct elements'
		deepEqual ( number for number in odds ), [1,3,5,7], 'Leaves first set unchanged'
		deepEqual ( number for number in evens ), [2,4,6,8], 'Leaves other sets unchanged'
		
		deepEqual ( number for number in Set.union odds), [1,3,5,7], 'Union works with single argument'
		deepEqual ( number for number in Set.union() ), [], 'Union works with zero arguments'
		
		equals union instanceof Set, true, 'Returns a Set'
		raises (-> Set.union 1, evens ), 'Raises an exception if first argument not a Set'
		raises (-> Set.union odds, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.intersection', ->
		
		numbers   = new Set [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8]
		evens     = new Set [-8,-6,-4,-2,0,2,4,6,8]
		positives = new Set [1,2,3,4,5,6,7,8]
		
		intersection = Set.intersection numbers, evens, positives
		
		deepEqual ( number for number in intersection ).sort(), [2,4,6,8], 'Intersection contains correct elements'
		deepEqual ( number for number in numbers ), [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8], 'Leaves first set unchanged'
		deepEqual ( number for number in evens ), [-8,-6,-4,-2,0,2,4,6,8], 'Leaves other sets unchanged'
		
		deepEqual ( number for number in Set.intersection positives), [1,2,3,4,5,6,7,8], 'Intersection works with single argument'
		deepEqual ( number for number in Set.intersection() ), [], 'Intersection works with zero arguments'
		
		equals intersection instanceof Set, true, 'Returns a Set'
		raises (-> Set.intersection 1, evens ), 'Raises an exception if first argument not a Set'
		raises (-> Set.intersection numbers, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.difference', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		odds    = new Set [1,3,5,7]
		
		difference = Set.difference numbers, odds
		
		deepEqual ( number for number in difference ).sort(), [2,4,6,8], 'Difference contains correct elements'
		deepEqual ( number for number in numbers ), [1,2,3,4,5,6,7,8], 'Leaves first set unchanged'
		deepEqual ( number for number in odds ), [1,3,5,7], 'Leaves second set unchanged'
		
		equals difference instanceof Set, true, 'Returns a Set'
		raises (-> Set.difference 1, odds ), 'Raises an exception if first argument not a Set'
		raises (-> Set.difference numbers, 1 ), 'Raises an exception if second argument not a Set'