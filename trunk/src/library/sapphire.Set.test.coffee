	module 'Set'
	
	test 'Set constructor', ->
		
		set = new Set ['red','green','blue']
		
		equals set.length, 3, 'Set returns a set with correct cardinality'
		deepEqual ( member for member in set ), ['red','green','blue'], 'Set contains correct elements'