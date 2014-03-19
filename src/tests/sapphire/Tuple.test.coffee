	module 'Tuple'
	
	test 'Tuple.Of', ->
		
		Person = Tuple.Of Number, String, String
		
		fred = new Person 1, 'fred', 'smith'
		
		[id,forename,surname] = fred
		
		deepEqual [id,forename,surname], [1,'fred','smith'], 'Sets elements correctly'
		
		fred2 = new Person 1, 'fred', 'smith'
		john  = new Person 2, 'john', 'smith'
		
		equal Tuple.equal(fred,john), false, 'Tuples with different values are not equal'
		equal Tuple.equal(fred,fred2), true, 'Tuples with same values are equal'