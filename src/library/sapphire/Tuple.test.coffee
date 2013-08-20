	module 'Tuple'
	
	test 'Tuple.Of', ->
		
		Person = Tuple.Of Number, String, String
		
		fred = new Person 1, 'fred', 'smith'
		
		[id,forename,surname] = fred
		
		deepEqual [id,forename,surname], [1,'fred','smith'], 'Sets elements correctly'