	module 'List'
	
	test 'List::where', ->
		
		numbers = new List [1,2,3,4,5,6,7,8,9]
		odd = (x) -> x % 2 == 1
		
		odds = numbers.where odd
		
		deepEqual ( number for number in odds ), [1,3,5,7,9], 'Filtered list contains correct elements'
		deepEqual ( number for number in numbers ), [1,2,3,4,5,6,7,8,9], 'Leaves original set unchanged'
		
		equals odds instanceof List, true, 'Returns a List'
		raises (-> numbers.map 'red'), 'Raises an exception if argument is not a function'
	
	test 'List::map', ->
		
		numbers = new List [1,2,3,4,5,6,7,8,9]
		squares = numbers.map (x) -> x*x
		
		deepEqual ( number for number in squares ), [1,4,9,16,25,36,49,64,81], 'Mapped set contains correct elements'
		deepEqual ( number for number in numbers ), [1,2,3,4,5,6,7,8,9], 'Leaves original set unchanged'
		
		equals squares instanceof List, true, 'Returns a List'
		raises (-> numbers.map 'red'), 'Raises an exception if argument is not a function'
		
	test 'List.concat', ->
		
		first  = [1,2,3]
		second = [4,5,6]
		third  = [7,8,9]
		
		numbers = List.concat first, second, third
		
		deepEqual ( number for number in numbers ), [1,2,3,4,5,6,7,8,9], 'Concatenates correctly'
		
		equals numbers instanceof List, true, 'Returns correct type'
		
		deepEqual ( x for x in List.concat() ), [], 'Correctly handles zero arguments'