	module 'Array'
	
	test 'Array.zip', ->
		
		deepEqual Array.zip( [1,2], [3,4,5] ), [[1,3],[2,4]], 'Only zips matching elements of arrays of unequal length'