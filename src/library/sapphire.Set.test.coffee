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
		
		equals evens instanceof Set, true, 'Returns a Set'
		raises (-> numbers.where 'red'), 'Raises an exception if argument is not a function'
		
	test 'Set::map', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		squares = numbers.map (x) -> x*x
		
		deepEqual ( member for member in squares ), [1,4,9,16,25,36,49,64], 'Mapped set contains correct elements'
		deepEqual ( member for member in numbers ), [1,2,3,4,5,6,7,8], 'Leaves original set unchanged'
		
		equals squares instanceof Set, true, 'Returns a Set'
		raises (-> numbers.map 'red'), 'Raises an exception if argument is not a function'
		
	test 'Set::partition', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		
		is_even = (x) -> x % 2 == 0
		
		key = (x) -> if is_even x then 'even' else 'odd'
		
		partition = numbers.partition key
		
		deepEqual ( member for member in partition.get 'even' ).sort(), [2,4,6,8], 'Produces correct value for key'
		
		equals partition instanceof Map, true, 'Returns a Map'
		raises (-> numbers.partition 'red' ), 'Raises an exception if argument not a function'
	
	test 'Set.union', ->
		
		odds  = new Set [1,3,5,7]
		evens = new Set [2,4,6,8]
		zero  = new Set [0]
		
		union = Set.union odds, evens, zero
	
		deepEqual ( member for member in union ).sort(), [0,1,2,3,4,5,6,7,8], 'Union contains correct elements'
		deepEqual ( member for member in odds ), [1,3,5,7], 'Leaves first set unchanged'
		deepEqual ( member for member in evens ), [2,4,6,8], 'Leaves other sets unchanged'
		
		deepEqual ( member for member in Set.union odds), [1,3,5,7], 'Union works with single argument'
		deepEqual ( member for member in Set.union() ), [], 'Union works with zero arguments'
		
		equals union instanceof Set, true, 'Returns a Set'
		raises (-> Set.union 1, evens ), 'Raises an exception if first argument not a Set'
		raises (-> Set.union odds, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.intersection', ->
		
		numbers   = new Set [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8]
		evens     = new Set [-8,-6,-4,-2,0,2,4,6,8]
		positives = new Set [1,2,3,4,5,6,7,8]
		
		intersection = Set.intersection numbers, evens, positives
		
		deepEqual ( member for member in intersection ).sort(), [2,4,6,8], 'Intersection contains correct elements'
		deepEqual ( member for member in numbers ), [-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8], 'Leaves first set unchanged'
		deepEqual ( member for member in evens ), [-8,-6,-4,-2,0,2,4,6,8], 'Leaves other sets unchanged'
		
		deepEqual ( member for member in Set.intersection positives), [1,2,3,4,5,6,7,8], 'Intersection works with single argument'
		deepEqual ( member for member in Set.intersection() ), [], 'Intersection works with zero arguments'
		
		equals intersection instanceof Set, true, 'Returns a Set'
		raises (-> Set.intersection 1, evens ), 'Raises an exception if first argument not a Set'
		raises (-> Set.intersection numbers, 1 ), 'Raises an exception if second argument not a Set'
	
	test 'Set.difference', ->
		
		numbers = new Set [1,2,3,4,5,6,7,8]
		odds    = new Set [1,3,5,7]
		
		difference = Set.difference numbers, odds
		
		deepEqual ( member for member in difference ).sort(), [2,4,6,8], 'Difference contains correct elements'
		deepEqual ( member for member in numbers ), [1,2,3,4,5,6,7,8], 'Leaves first set unchanged'
		deepEqual ( member for member in odds ), [1,3,5,7], 'Leaves second set unchanged'
		
		equals difference instanceof Set, true, 'Returns a Set'
		raises (-> Set.difference 1, odds ), 'Raises an exception if first argument not a Set'
		raises (-> Set.difference numbers, 1 ), 'Raises an exception if second argument not a Set'