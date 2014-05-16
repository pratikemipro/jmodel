	module 'Array'
	
	test 'Array.concat', ->
		
		deepEqual Array.concat(), [], 'Concatenation of zero arrays is empty array'
		deepEqual Array.concat([1,2,3]), [1,2,3], 'Concatenation of one array is array'
		deepEqual Array.concat([1,2],[3,4],[5,6]), [1,2,3,4,5,6], 'Concatenation works with more than two arguments'
		deepEqual Array.concat([1,2],3,4,[5,6]), [1,2,3,4,5,6], 'Concatenation treats bare elements as one-element arrays'
		
	test 'Array.map', ->
		
		double = (x) -> 2*x
		
		deepEqual Array.map(double)([]), [], 'Array mapping works with empty arrays'
		deepEqual Array.map(double)([1,2,3,4,5]), [2,4,6,8,10], 'Array mapping works with non-empty arrays'
	
	test 'Array.zip', ->
		
		deepEqual Array.zip(), [], 'Zip of zero arrays is empty array'
		deepEqual Array.zip([1,2]), [[1],[2]], 'Zip works with one argument'
		deepEqual Array.zip([1,2],[3,4]), [[1,3],[2,4]], 'Zip works with two arguments'
		deepEqual Array.zip([1,2,3],[4,5,6],[7,8,9]), [[1,4,7],[2,5,8],[3,6,9]], 'Zip works with more than two arguments'
		deepEqual Array.zip( [1,2], [3,4,5] ), [[1,3],[2,4]], 'Only zips matching elements of arrays of unequal length'
		
	test 'Array.zipWith', ->
		
		deepEqual Array.zipWith(Math.plus)(), [], 'zipWith of zero arrays is empty array'
		deepEqual Array.zipWith(Math.plus)([1,2],[3,4]), [4,6], 'zipWith works with equal length arrays'
		deepEqual Array.zipWith(Math.plus)([1,2],[3,4,5]), [4,6], 'Only zips matching elements of arrays of unequal length'
		
	test 'Array.flatten', ->
		
		deepEqual Array.flatten(), [], 'Empty argument flattens to empty array'
		deepEqual Array.flatten( [1,2,3,4] ), [1,2,3,4], 'Flat array is returned unchanged'
		deepEqual Array.flatten( [[1,2],[3,4],[5,6]] ), [1,2,3,4,5,6], 'Flattens array of arrays'
		deepEqual Array.flatten( [[1,[2,3]],[[4,5],6]] ), [1,2,3,4,5,6], 'Flatten works with differing depths'
		
	test 'Array.equal', ->
		
		equal Array.equal([1,2],[1]), false, 'Arrays with unequal lengths are not equal'
		equal Array.equal([1,2,3],[1,4,3]), false, 'Array with unequal elements are not equal'
		equal Array.equal([1,2,3],[1,2,3]), true, 'Arrays with equal elements are equal'
		equal Array.equal([1,2,3],['1','2','3']), false, 'Equality testing is strict'
		
	test 'Array.hastypes', ->

		equal Array.hastypes()([]), true, 'Returns true for empty array when type array is empty'
		equal Array.hastypes()([5]), false, 'Returns false for non-empty array when type array is empty'
		equal Array.hastypes(Number)([5]), true, 'Returns true for single element array having correct type'
		equal Array.hastypes(Number,String,Number)([5,'fred',7]), true, 'Works for longer arrays'
		equal Array.hastypes([Number])([1,2,3]), true, 'Works for array type specifiers'
		equal Array.hastypes([Number])(), true, 'Array type specifiers include zero length case'
	
	test 'Array.all', ->
		
		odd = (i) -> i % 2 == 1
		
		equal Array.all(odd)([]), true, 'Returns true for empty array (for all predicates)'
		equal Array.all(odd)([1,3,5,7]), true, 'Returns true if all elements match predicate'
		equal Array.all(odd)([1,3,4,5,7]), false, 'Returns false if any element does not match predicate'
		
	test 'Array::all', ->
		
		odd = (i) -> i % 2 == 1
		
		equal [].all(odd), true, 'Returns true for empty array (for all predicates)'
		equal [1,3,5,7].all(odd), true, 'Returns true if all elements match predicate'
		equal [1,3,4,5,7].all(odd), false, 'Returns false if any element does not match predicate'
	
	test 'Array.any', ->
		
		odd = (i) -> i % 2 == 1
		
		equal Array.any(odd)([]), false, 'Returns false for empty arrays (for all predicates)'
		equal Array.any(odd)([2,4,6]), false, 'Returns false if no element matches predicate'
		equal Array.any(odd)([2,4,5,6]), true, 'Returns true if any element matches predicate'
	
	test 'Array::any', ->
		
		odd = (i) -> i % 2 == 1
		
		equal [].any(odd), false, 'Returns false for empty arrays (for all predicates)'
		equal [2,4,6].any(odd), false, 'Returns false if no element matches predicate'
		equal [2,4,5,6].any(odd), true, 'Returns true if any element matches predicate'
	
	test 'Array.none', ->
		
		odd = (i) -> i % 2 == 1
		
		equal Array.none(odd)([]), true, 'Returns true for empty array (for all predicates)'
		equal Array.none(odd)([2,4,6,8]), true, 'Returns true if no elements match predicate'
		equal Array.none(odd)([2,4,5,6,8]), false, 'Returns false if any element matches predicate'
		
	test 'Array::none', ->
		
		odd = (i) -> i % 2 == 1
		
		equal [].none(odd), true, 'Returns true for empty array (for all predicates)'
		equal [2,4,6,8].none(odd), true, 'Returns true if no elements match predicate'
		equal [2,4,5,6,8].none(odd), false, 'Returns false if any element matches predicate'
	
	test 'Array.count', ->
		
		odd = (i) -> i % 2 == 1
		numbers = [1,2,3,4,5,6,7,8,9]
		
		equal numbers.reduce(Array.count()), 9, 'Counts all elements if called without a predicate'
		equal numbers.reduce(Array.count odd), 5, 'Counts elements matching predicate'
		
		equal numbers.reduce(Array.count -> this % 2 == 1), 5, 'Can use values via context'
		
	test 'Array::count', ->
		
		odd = (value) -> value % 2 == 1
		numbers = [1,2,3,4,5,6,7,8,9]
		
		equal numbers.count(), 9, 'Counts all elements if called without a predicate'
		equal numbers.count(odd), 5, 'Counts elements matching predicate'
		
		equal numbers.count(-> this % 2 == 1), 5, 'Can use values via context'
		
	test 'Array.contains', ->
		
		odd = (value) -> value % 2 == 1
		numbers = [1,2,3,4,5,6,7,8,9]
		evens = [2,4,6,8]
		
		equal numbers.reduce(Array.contains(),false), true, 'Returns true for non-empty array when called without predicate'
		
		equal numbers.reduce(Array.contains(odd),false), true, 'Returns true if array contains element matching predicate'
		equal evens.reduce(Array.contains(odd),false), false, 'Returns false if array does not contain element matching predicate'
		
		equal numbers.reduce(Array.contains -> this % 2 == 1), true, 'Can use values via context'
	
	test 'Array::contains', ->
		
		odd = (value) -> value % 2 == 1
		numbers = [1,2,3,4,5,6,7,8,9]
		evens = [2,4,6,8]
		
		equal numbers.contains(), true, 'Returns true for non-empty array when called without predicate'
		
		equal numbers.contains(odd), true, 'Returns true if array contains element matching predicate'
		equal evens.contains(odd), false, 'Returns false if array does not contain element matching predicate'
		
		equal numbers.contains(-> this % 2 == 1), true, 'Can use values via context'