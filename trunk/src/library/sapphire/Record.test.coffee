	module 'Record'
	
	test 'Constructor', ->

		Person = Record.Of
			name: String
			dob: Date
			affiliations: Set.Of(String)
			
		einstein = new Person
			name: 'Albert Einstein'
			dob: '1879-3-14'
			affiliations: ['Swiss Patent Office','Insititute for Advanced Study']
			
		console.log einstein
		
		equals typeof einstein.name() == 'string', true, 'Creates string fields of correct type'
		equals einstein.name(), 'Albert Einstein', 'Creates string fields with correct value'
		
		equals einstein.dob() instanceof Date, true, 'Creates date fields of correct type'
		equals einstein.dob().toDateString(), 'Fri Mar 14 1879', 'Creates string fields with correct value'
		
		equals einstein.affiliations() instanceof Set, true, 'Creates composite fields of correct type'
		deepEqual ( org for org in einstein.affiliations() ), ['Swiss Patent Office','Insititute for Advanced Study'], 'Passes correct constructor arguments'
		
		einstein.name 'Al Einstein'
		
		equals einstein.name(), 'Al Einstein', true, 'String fields can be updated'
		
		einstein.name (name) -> "#{name} rules!"
		
		equals einstein.name(), 'Al Einstein rules!', true, 'String fields allow functional updates'