	module 'Array'
	
	test 'Array.concat', ->
		
		deepEqual Array.concat(), [], 'Concatenation of zero arrays is empty array'
		deepEqual Array.concat([1,2,3]), [1,2,3], 'Concatenation of one array is array'
		deepEqual Array.concat([1,2],[3,4],[5,6]), [1,2,3,4,5,6], 'Concatenation works with more than two arguments'
		deepEqual Array.concat([1,2],3,4,[5,6]), [1,2,3,4,5,6], 'Concatenation treats bare elements as one-element arrays'
	
	test 'Array.zip', ->
		
		deepEqual Array.zip(), [], 'Zip of zero arrays is empty array'
		deepEqual Array.zip([1,2]), [[1],[2]], 'Zip works with one argument'
		deepEqual Array.zip([1,2],[3,4]), [[1,3],[2,4]], 'Zip works with two arguments'
		deepEqual Array.zip([1,2,3],[4,5,6],[7,8,9]), [[1,4,7],[2,5,8],[3,6,9]], 'Zip works with more than two arguments'
		deepEqual Array.zip( [1,2], [3,4,5] ), [[1,3],[2,4]], 'Only zips matching elements of arrays of unequal length'
		
	test 'Array.flatten', ->
		
		deepEqual Array.flatten(), [], 'Empty argument flattens to empty array'
		deepEqual Array.flatten( [1,2,3,4] ), [1,2,3,4], 'Flat array is returned unchanged'
		deepEqual Array.flatten( [[1,2],[3,4],[5,6]] ), [1,2,3,4,5,6], 'Flattens array of arrays'
		deepEqual Array.flatten( [[1,[2,3]],[[4,5],6]] ), [1,2,3,4,5,6], 'Flatten works with differing depths'
		
	test 'Array.hastypes', ->

		equal Array.hastypes()([]), true, 'Returns true for empty array when type array is empty'
		equal Array.hastypes()([5]), false, 'Returns false for non-empty array when type array is empty'
		equal Array.hastypes(Number)([5]), true, 'Returns true for single element array having correct type'
		equal Array.hastypes(Number,String,Number)([5,'fred',7]), true, 'Works for longer arrays'
		equal Array.hastypes([Number])([1,2,3]), true, 'Works for array type specifiers'
		equal Array.hastypes([Number])(), true, 'Array type specifiers include zero length case'
		
	test 'Array.count', ->
		
		odd = (value) -> value % 2 == 1
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