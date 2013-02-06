	module 'Basic functions'
	
	test 'Function.identity', ->
		
		obj = name: 'test'
		
		equals Function.identity(obj), obj, 'Works for objects'
		equals Function.identity(17), 17, 'Words for bare values'
		
	test 'Function.constant', ->
		
		fred = Function.constant 'fred'
		
		equals fred(), 'fred', 'Works with no arguments'
		equals fred(1,2,3), 'fred', 'Works with arguments'
		
	test 'Function.argument', ->
	
		equals Function.argument(0).call(this,'red','green','blue'), 'red', 'Function.argument(0) works'
		equals Function.argument(1).call(this,'red','green','blue'), 'green', 'Function.argument(1) works'
		equals Function.argument(2).call(this,'red','green','blue'), 'blue', 'Function.argument(2) works'
		equals Function.argument(4).call(this,'red','green','blue'), undefined, 'Function.argument(4) returns undefined if beyond bounds'
		
		# equals Function.argument(2).hastype('string').call(this,'red','green','blue'), true, 'Function.argument(4).hastype returns false if type does not match'
		# equals Function.argument(2).hastype('number').call(this,'red','green','blue'), false, 'Function.argument(4).hastype returns false if type does not match'
		
	test 'Function.map', ->
	
		counts = Function.map
			quarks: 6
			chargedLeptons: 3
			neutrinos: 3
		
		equals counts('quarks'), 6, 'Works for first mapping entry'
		equals counts('chargedLeptons'), 3, 'Works for other mapping entries'

	module 'Function composition'
	
	test 'Function::then', ->
	
		red = (arr) -> arr.push 'red'; arr
		green = (arr) -> arr.push 'green'; arr
		blue = (arr) -> arr.push 'blue'; arr	
			
		deepEqual red.then(green)([]), ['red','green'], 'then works'
		deepEqual red.then(green.then(blue))([]), red.then(green).then(blue)([]), 'then is associative'
		
	test 'Function::but', ->
	
		arr = []
		red = (arr) -> arr.push('red'); arr
		length = (arr) -> arr.length
		
		equal red.but(length)(arr), 1, 'return value of second returned'
		deepEqual arr, ['red'], 'first function has been applied'

	test 'Function.pipe', ->

		times2 = (x) -> 2*x
		addten = (x) -> x+10

		equals Function.pipe(times2,addten)(7), 24, 'piping of two functions works'
		equals Function.pipe(addten,times2)(7), 34, 'piping works in opposite direction'
		equals Function.pipe(times2)(7), 14, 'pipe of a single function is just that function'
		equals Function.pipe()(7), 7, 'pipe of no functions is identity'

	test 'Function.compose', ->
	
		times2 = (x) -> 2*x
		addten = (x) -> x+10
			
		equals Function.compose(times2,addten)(7), 34, 'composition of two functions works'
		equals Function.compose(addten,times2)(7), 24, 'composition works in opposite direction'
		equals Function.compose(times2)(7), 14, 'composition of a single function is just that function'
		equals Function.compose()(7), 7, 'composition of no functions is identity'
	
	module 'Aspect-like methods'
	
	test 'Function::pre', ->
	
		a = 0
		red = -> 'red'
		inc = -> a++
		getA = -> a
		
		equal red.pre(inc)(), 'red', 'pre does not interfere with function'
		equal a, 1, 'pre function runs first'
		equal getA.pre(inc)(), 2, 'pre function runs first'
		
	test 'post', ->
	
		logged = ''
		log = (c,a,b) -> logged = a+'+'+b+'='+c
		add = ((a,b) -> a+b).post(log)
			
		equal add(2,3), 5, 'Post-function does not affect operation of function'
		equal logged, '2+3=5', 'Post-function is run and has access to arguments and return value'
	
	module 'Preconditions and postconditions'
	
	test 'require', ->
		
		add2 = (x) -> x+2
		safeAdd2 = add2.require( Function.argument(0).hastype('number') )
		restrictedAdd2 = add2.require( Function.argument(0).hastype('number'), Function.argument(0).between(0,5) )
		
		equal safeAdd2(2), 4, 'Works as normal if requirements satisfied'
		raises ( -> safeAdd2('fred') ), 'Throws exception if requirements not satisfied'
		
		equals restrictedAdd2(2), 4, 'Works as normal if requirments satisfied'
		raises ( -> restrictedAdd2('fred') ), 'Throws exception if first requirment unsatisfied'
		raises ( -> restrictedAdd2(6) ), 'Throws exception if second requirment unsatisfied'
		
	test 'ensure', ->
	
		add = (a,b) -> a+b
		faultyAdd = (a,b) -> a+b+1
		safeAdd = add.ensure( (c,a,b) -> c == a+b )
		safeFaultyAdd = faultyAdd.ensure( (c,a,b) -> c == a+b )
			
		equals safeAdd(2,3), 5, 'Works as expected when postcondition satisfied'
		raises ( -> safeFaultyAdd(2,3) ), 'Throws exception if postcondition unsatisfied'
	
	module 'Typed functions'
	
	test 'Function.Requiring', ->
		
		Person = () ->
		Person::setAge = Function.Requiring( (age) -> 18 <= age <= 65 ) (age) -> @age = age
		
		fred = new Person()
		fred.setAge 30
		
		equals fred.age, 30, 'Respects context'
		raises ( -> fred.setAge 70 ), 'Throws exception if argument violates precondition'
	
	test 'Function.From', ->
		
		inc = Function.From(Number) (x) -> x+1
		
		equals inc(3), 4, 'works as untyped function when called with argument of correct type'
		raises ( -> inc('red') ), 'raises an exception when called with argument of wrong type'
		
		repeat = Function.From(Number,String) (n,s) -> (s for i in [1..n]).join('')
		
		equals repeat(3,'a'), 'aaa', 'works as untyped function when called with arguments of correct type'
		raises ( -> repeat('n','a') ), 'raises exception when first argument is of wrong type'
		raises ( -> repeat(3,3) ), 'raises exception when second argument is of wrong type'
		
		Person = class
			constructor: Function.From(String) (@name) ->
		
		fred = new Person 'fred'	
		
		equals fred.name, 'fred', 'constructor works as untyped constructor when arguments of correct type'
		raises ( -> new Person 3 ), 'constructor raises exception when arguments have wrong type'
		
	
	test 'Function.To', ->
		
		add = Function.To(Number) (a,b) -> a+b
		
		equals add(2,3), 5, 'works as untyped function when return value of correct type'
		raises ( -> add('a','b') ), 'raises exception when return value of wrong type'
		
		Entity = class
			constructor: (@name) ->
			getName: Function.To(String) -> @name
			
		fred = new Entity 'fred'
		robot = new Entity 3
		
		equals fred.getName(), 'fred', 'works as untyped method when return value of correct type'
		raises ( -> robot.getName() ), 'raises exception when return value method has incorrect type'
		
		
	test 'Function.From.To', ->
		
		inc = Function.From(Number).To(Number) (x) -> if x==2 then 'red' else x+1
		
		inc2 = Function.To(Number).From(Number) (x) -> if x==2 then 'red' else x+1
		
		equals inc(3), 4, 'works as untyped function when called with argument of correct type and returns correct type'
		raises ( -> inc('red') ), 'raises an exception when called with argument of wrong type'
		raises ( -> inc(2) ), 'raises an exception when returning wrong type'
		
		equals inc2(3), 4, 'works as untyped function when called with argument of correct type and returns correct type, with From and To reversed'
		raises ( -> inc2('red') ), 'raises an exception when called with argument of wrong type, with From and To reversed'
		raises ( -> inc2(2) ), 'raises an exception when returning wrong type, with From and To reversed'
		
	module 'Logical functions'
	
	test 'Function::and', ->
	
		gt = (x) -> x>2
		lt = (x) -> x<6
		comp = gt.and lt;
			
		equals comp(4), true, 'true if both conditions true'
		equals comp(1), false, 'false if first condition false'
		equals comp(7), false, 'false if second condition false'
		
	test 'Function::or', ->
	
		gt = (x) -> x>2
		lt = (x) -> x<2
		comp = gt.or lt
			
		equals comp(3), true, 'true if first condition true'
		equals comp(1), true, 'true if second condition true'
		equals comp(2), false, 'false if both conditions false'
		
	test 'Function::not', ->
	
		isOdd = (x) -> x % 2 == 1
	
		equals isOdd(5), true, 'Base function works'
		equals isOdd.not()(5), false, 'Works as expected when base returns true'
		equals isOdd.not()(6), true, 'Works as expected when base returns false'

	test 'Function.and', ->
	
		equals Function.and()(5), true, 'or of zero arguments is true'
		equals Function.and(Function.eq(5))(5), true, 'and with one argument returns true when predicate is true'
		equals Function.and(Function.eq(5))(7), false, 'and with one argument returns false when predicate is false'
		
		equals Function.and(Function.lt(5),Function.lt(6))(3), true, 'and with two arguments returns true when both are true'
		equals Function.and(Function.eq(5),Function.eq(6))(6), false, 'and with two arguments returns false when first is false'
		equals Function.and(Function.eq(5),Function.eq(6))(5), false, 'or with two arguments returns false when second is false'
		equals Function.and(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'
		
	test 'Function.or', ->
	
		equals Function.or()(5), false, 'or of zero arguments is false'
		equals Function.or(Function.eq(5))(5), true, 'or with one argument returns true when predicate is true'
		equals Function.or(Function.eq(5))(7), false, 'or with one argument returns false when predicate is false'
		
		equals Function.or(Function.eq(5),Function.eq(6))(5), true, 'or with two arguments returns true when first is true'
		equals Function.or(Function.eq(5),Function.eq(6))(6), true, 'or with two arguments returns true when second is true'
		equals Function.or(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'

	test 'Function.not', ->
	
		equals Function.not(Function.eq(5))(6), true, 'not returns true when predicate returns false'
		equals Function.not(Function.eq(5))(5), false, 'not returns false when predicate returns true'
	
	module 'Function: Ordering'
	
	test 'Function.asc', ->
		
	module 'Comparison predicates'
		
	test 'Function::eq', ->
		
		equal Function.eq(5)(5), true, 'returns true when applied to value equal to argument'
		equal Function.eq(5)(3), false, 'returns false when applied to value not equal to argument'
		
		
	test 'Function::neq', ->
		
		equal Function.neq(5)(3), true, 'returns true when applied to value not equal to argument'
		equal Function.neq(5)(5), false, 'returns false when applied to value equal to argument'


	test 'Function::lt', ->
		
		equal Function.lt(5)(3), true, 'returns true when applied to value less than argument'
		equal Function.lt(5)(5), false, 'returns false when applied to value equal to argument'
		equal Function.lt(5)(7), false, 'returns false when applied to value greater than argument'
		
	test 'Function::gt', ->
		
		equal Function.gt(5)(3), false, 'returns false when applied to value less than argument'
		equal Function.gt(5)(5), false, 'returns false when applied to value equal to argument'
		equal Function.gt(5)(7), true, 'returns true when applied to value greater than argument'
		
	test 'Function::lte', ->
		
		equal Function.lte(5)(3), true, 'returns true when applied to value less than argument'
		equal Function.lte(5)(5), true, 'returns true when applied to value equal to argument'
		equal Function.lte(5)(7), false, 'returns false when applied to value greater than argument'
		
	test 'Function::gte', ->
		
		equal Function.gte(5)(3), false, 'returns false when applied to value less than argument'
		equal Function.gte(5)(5), true, 'returns true when applied to value equal to argument'
		equal Function.gte(5)(7), true, 'returns true when applied to value greater than argument'
		
	test 'Function::between', ->
		
		equal Function.between(3,5)(2), false, 'returns false when applied to value less than lower bound'
		equal Function.between(3,5)(3), true, 'returns true when applied to value equal to lower bound'
		equal Function.between(3,5)(4), true, 'returns true when applied to value strictly between bounds'
		equal Function.between(3,5)(5), true, 'returns true when applied to value equal to upper bound'
		equal Function.between(3,5)(6), false, 'returns false when applied to value greater than upper bound'
		raises ( -> Function.between(5,3) ), 'throws exception when lower bound not less or equal to upper bound'
		
	module 'Property methods'
	
	test 'Function::as', ->
	
		fn = -> 'red'
			
		equals fn.as('test').displayName, 'test', 'as sets displayName of function'
		equals fn.as('test')(), 'red', 'function runs normally after use of "as"'
		
	test 'Function::extend', ->
	
		fn = -> 'red'
			
		equals fn.extend(type:'accessor').type, 'accessor', 'extend sets properties of function'
		equals fn.extend(type:'accessor')(), 'red', 'function runs normally after use of "extend"'
		
	module 'Application methods'
	
	test 'Function::bind', ->
	
		person = name:'fred'
		getName = -> this.name
			
		equals getName.bind(person)(), 'fred', 'bind works'
		
	test 'Function::curry', ->
	    
	   add = (a,b) -> a+b
	  
	   equals add.curry(3)(5), 8, 'curry works'
	   
	test 'Function::except', ->
	
		faulty = -> throw 'bang!'
		handled = faulty.except( (err) -> 'Error: '+err )
			
		equal handled(), 'Error: bang!', 'except works correctly in simplest case'
		
	test 'Function::memo', ->
	
		add = ( (a,b) -> a+b ).memo();
		
		equals add(2,3), 5, 'memoized function works normally on first call'
		equals add(2,3), 5, 'memoized function works normally on subsequent calls'
		
	module 'Mapping methods'
	
	test 'Function::map', ->
	
		mod2 = (x) -> x % 2
		oddEven = mod2.map
			0: 'even',
			1: 'odd'
			
		equal oddEven(6), 'even', 'Works for first mapping entry'
		equal oddEven(7), 'odd', 'Works for second mapping entry'

	