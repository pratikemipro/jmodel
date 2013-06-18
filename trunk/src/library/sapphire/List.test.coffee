	module 'List'
	
	test 'List::map', ->
		
		numbers = new List [1,2,3,4,5,6,7,8]
		squares = numbers.map (x) -> x*x
		
		deepEqual ( number for number in squares ), [1,4,9,16,25,36,49,64], 'Mapped set contains correct elements'
		deepEqual ( number for number in numbers ), [1,2,3,4,5,6,7,8], 'Leaves original set unchanged'
		
		equals squares instanceof List, true, 'Returns a List'
		raises (-> numbers.map 'red'), 'Raises an exception if argument is not a function'