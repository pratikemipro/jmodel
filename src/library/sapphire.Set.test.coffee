define (), ->
	
	module 'Set construction'
	
	test 'Set constructor', ->
		
		var set = new Set ['red','green','blue']
		
		equals set.count(), 3, 'Set returns a set with correct cardinality'
		deepEqual ( member for member in set ), ['red','green','blue'], 'Set contains correct elements'