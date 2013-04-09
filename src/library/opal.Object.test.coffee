	module 'Object'
	
	test 'Object.extend', ->
		
		source =
			forename: 'john'
			surname: 'smith'
			
		target = {}
		
		Object.extend target, source
		
		equals target.forename, 'john', 'Copies first property correctly'
		equals target.surname, 'smith', 'Copies second property correctly'
		
	test 'Object.construct', ->
	
		Person = (@name,@age) ->
		
		equals Object.construct(Person)('fred',16) instanceof Person, true, 'Creates object of correct type'
		equals Object.construct(Person)('fred',16).name, 'fred', 'First argument passed correctly'
		equals Object.construct(Person)('fred',16).age, 16, 'Second argument passed correctly'
		
		equals Object.construct(Person,'fred')(16).name, 'fred', 'Arguments can be passed in at definition time'
		equals Object.construct(Person,'fred')(16).age, 16, 'Arguments at call time passed in correctly when there are definition time arguments'
		
		equals typeof Object.construct(String)('fred'), 'string', 'Construct handles strings correctly'
		equals typeof Object.construct(Number)(7), 'number', 'Construct handles numbers correctly'
		equals typeof Object.construct(Boolean)(true), 'boolean', 'Construct handles booleans correctly'
		equals Object.construct(Boolean)(true), true, 'Construct handles boolean true correctly'
		equals Object.construct(Boolean)(false), false, 'Construct handles boolean false correctly'
		 
		equals Object.construct(Date)('1997-8-29') instanceof Date, true, 'Construct creates date from string'
		equals Object.construct(Date)('1997-8-29').getFullYear(), 1997, 'Construct creates date with correct year from string'
		equals Object.construct(Date)('1997-8-29').getMonth(), 7, 'Construct creates date with correct month index from string' # NB Date object has crazy month indexing
		equals Object.construct(Date)('1997-8-29').getDate(), 29, 'Construct creates date with correct day from string'
		 
		equals Object.construct(Date)('1997-8-29') instanceof Date, true, 'Construct creates date from string'
		equals Object.construct(Date)('1997-8-29').getFullYear(), 1997, 'Construct creates date with correct year from string'
		equals Object.construct(Date)('1997-8-29').getMonth(), 7, 'Construct creates date with correct month index from string' # NB: Date object has crazy month indexing
		equals Object.construct(Date)('1997-8-29').getDate(), 29, 'Construct creates date with correct day from string'
		 
		equals Object.construct(Date)(1997,7,29) instanceof Date, true, 'Construct creates date from three integers'
		equals Object.construct(Date)(1997,7,29).getFullYear(), 1997, 'Construct creates date with correct year from three integers'
		equals Object.construct(Date)(1997,7,29).getMonth(), 7, 'Construct creates date with correct month index from three integers' # NB: Date object has crazy month indexing
		equals Object.construct(Date)(1997,7,29).getDate(), 29, 'Construct creates date with correct day from three integers'
		 
		equals Object.construct(Date)(1997,7,29,11,37,45,231) instanceof Date, true, 'Construct creates date from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getFullYear(), 1997, 'Construct creates date with correct year from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getMonth(), 7, 'Construct creates date with correct month index from seven integers' # NB: Date object has crazy month indexing
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getDate(), 29, 'Construct creates date with correct day from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getHours(), 11, 'Construct creates date with correct hours from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getMinutes(), 37, 'Construct creates date with correct minutes from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getSeconds(), 45, 'Construct creates date with correct seconds from seven integers'
		equals Object.construct(Date)(1997,7,29,11,37,45,231).getMilliseconds(), 231, 'Construct creates date with correct milliseconds from seven integers'
		
	test 'Object.ensure', ->
	
		Person = (@name,@age) ->
		
		fred = new Person('fred',30);
		
		equals Object.ensure(Person)(fred), fred, 'Acts as identity when object is already of type'
		equals Object.ensure(Person)('jane',28) instanceof Person, true, 'Constructs new object when arguments not already of type'
		
		equals Object.ensure(Person,'fred')(28).name, 'fred', 'Allows passing at definition time'
		
	test 'Object.keys', ->
		
		a =
			forename: 'fred'
			surname: 'smith'
			age: 20
			title: 'Mr'
			
		deepEqual Object.keys(a), ['forename','surname','age','title'], 'Returns keys'