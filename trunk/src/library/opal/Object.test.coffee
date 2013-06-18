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
		
	test 'Object.property', ->
		
		fred =
			forename: 'fred'
			surname: 'smith'
			
		equals Object.property('surname')(fred), 'smith', 'property works on properties that exist'
		equals Object.property('age')(fred), undefined, 'property returns "undefined" for properties that do not exist'
	
		Object.property('surname','jones')(fred);
		equals fred.surname, 'jones', 'property allows setting of values at creation time'
	
		raises ( -> Object.property('age',17)(fred) ), 'raises exception on attempting to set property that does not exist'
		equals fred.age, undefined, 'property is not set if it does not exist'
		
	test 'Object.method', ->

		Adder = class
			unit: -> 0
			add: (a,b) -> a+b
	
		adder = new Adder();
	
		equals Object.method('unit')(adder),    0, 'Method works without any arguments'
		equals Object.method('add',2,3)(adder), 5, 'Method works with arguments at creation time'
		equals Object.method('add',2)(adder,3), 5, 'Method works with arguments at invocation time'
		raises (-> Object.method('test')(adder) ), 'Method raises exception if method does not exist.'
		
	test 'Object.resolve', ->
    
		class Person
			constructor: (@forename,@surname,@age) ->
			name: -> "#{@forename} #{@surname}"
			Forename: (@forename) -> this
	
		person = new Person 'John', 'Smith', 18
	
		equals Object.resolve('age')(person),  18,           'Resolve works with properties'
		equals Object.resolve('name')(person), 'John Smith', 'Resolve works with methods'
	
		Object.resolve('age',17)(person);
		equals person.age, 17, 'Resolve updates properties with values given at creation time'
    
		Object.resolve('Forename','Adam')(person)
		equals person.forename, 'Adam', 'Resolve updates methods with values given at creation time'

	test 'path', ->
	
		person = {
			name: {
				first: 'John',
				last: 'Smith'
			},
			job: -> {
				company: 'Cyberdyne',
				title: 'Developer'
			}
		}
	
		equals Object.path('name.last')(person), 'Smith', 'path works for paths specified in a string'
		equals Object.path('name/last','/')(person), 'Smith', 'path works for paths specified in a string with alternative separator'
		equals Object.path(['name','first'])(person), 'John', 'path works for paths specified in an array'
		equals Object.path('job.title')(person), 'Developer', 'path works for containing methods'
		equals Object.path(['job','title'])(person), 'Developer', 'path works for paths containing methods specified as arrays'
		equals Object.path('job.salary')(person), undefined, 'path returns undefined for paths that do not exist.'
