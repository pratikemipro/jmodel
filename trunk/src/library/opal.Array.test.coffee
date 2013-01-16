	module 'Array'
	
	test 'Array.zip', ->
		
		deepEqual Array.zip( [1,2], [3,4,5] ), [[1,3],[2,4]], 'Only zips matching elements of arrays of unequal length'
		
	test 'Array.flatten', ->
		
		deepEqual Array.flatten( [[1,2],[3,4],[5,6]] ), [1,2,3,4,5,6], 'Flattens array of arrays'