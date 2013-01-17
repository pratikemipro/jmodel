	module 'Object'
	
	test 'Object.extend', ->
		
		source =
			forename: 'john'
			surname: 'smith'
			
		target = {}
		
		Object.extend target, source
		
		equals target.forename, 'john', 'Copies first property correctly'
		equals target.surname, 'smith', 'Copies second property correctly'