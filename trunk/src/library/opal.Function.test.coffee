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
	
	module 'Logical functions'
		
	test 'Function::or', ->
	
		equals Function.or()(5), false, 'or of zero arguments is false'
		equals Function.or(Function.eq(5))(5), true, 'or with one argument returns true when predicate is true'
		equals Function.or(Function.eq(5))(7), false, 'or with one argument returns false when predicate is false'
		
		equals Function.or(Function.eq(5),Function.eq(6))(5), true, 'or with two arguments returns true when first is true'
		equals Function.or(Function.eq(5),Function.eq(6))(6), true, 'or with two arguments returns true when second is true'
		equals Function.or(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'

	test 'Function::and', ->
	
		equals Function.and()(5), true, 'or of zero arguments is true'
		equals Function.and(Function.eq(5))(5), true, 'and with one argument returns true when predicate is true'
		equals Function.and(Function.eq(5))(7), false, 'and with one argument returns false when predicate is false'
		
		equals Function.and(Function.lt(5),Function.lt(6))(3), true, 'and with two arguments returns true when both are true'
		equals Function.and(Function.eq(5),Function.eq(6))(6), false, 'and with two arguments returns false when first is false'
		equals Function.and(Function.eq(5),Function.eq(6))(5), false, 'or with two arguments returns false when second is false'
		equals Function.and(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'

	test 'Function::not', ->
	
		equals Function.not(Function.eq(5))(6), true, 'not returns true when predicate returns false'
		equals Function.not(Function.eq(5))(5), false, 'not returns false when predicate returns true'
	
	module 'Aspect-like methods'
	
	module 'Preconditions and postconditions'
	
	module 'Typed functions'
	
	test 'Function.To', ->
		
		add = Function.To(Number) (a,b) -> a+b
		
		equals add(2,3), 5, 'works as untyped function when return value of correct type'
		raises ( -> add('a','b') ), 'raises excption when return value of wrong type'
	
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
		
	