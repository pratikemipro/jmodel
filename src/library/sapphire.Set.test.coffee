	module 'Set'
	
	test 'Set constructor', ->
		
		set = new Set ['red','green','blue']
		
		equals set.length, 3, 'Set returns a set with correct cardinality'
		deepEqual ( member for member in set ), ['red','green','blue'], 'Set contains correct elements'
	
	test 'Set::count', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		equals numbers.count(), 8, 'Returns cardinality of set when called without a predicate'
		equals numbers.count((x) -> x % 2 == 0), 4, 'Returns number of elements matching predicate when called with predicate'
		
		
	test 'Set::where', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		evens = numbers.where (x) -> x % 2 == 0
		
		deepEqual ( member for member in evens ), [2,4,6,8], 'Filters according to criteria'
		deepEqual ( member for member in numbers), [1,2,3,4,5,6,7,8], 'Leaves original set unchanged'
		
	test 'Set::partition', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		is_even = (x) -> x % 2 == 0
		
		key = (x) -> if is_even x then 'even' else 'odd'
		
		partition = numbers.partition key
		
		deepEqual ( member for member in partition.get 'even' ), [2,4,6,8], 'Produces correct value for key'
		
	test 'Set.difference', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		odds    = new Set [1,3,5,7]
		
		deepEqual ( member for member in Set.difference numbers, odds ), [2,4,6,8], 'Difference contains correct elements'
		deepEqual ( member for member in numbers ), [1,2,3,4,5,6,7,8], 'Leaves first set unchanged'
		deepEqual ( member for member in odds ), [1,3,5,7], 'Leaves second set unchanged'
		
		raises (-> Set.difference 1, odds ), 'Raises an exception if first argument not a Set'
		raises (-> Set.difference numbers, 1 ), 'Raises an exception if second argument not a Set'