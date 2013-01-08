	module 'Function'
	
	test 'identity', ->
		
		obj = name: 'test'
		
		equals Function.identity(obj), obj, 'Works for objects'
		equals Function.identity(17), 17, 'Words for bare values'
		
	test 'constant', ->
		
		fred = Function.constant 'fred'
		
		equals fred(), 'fred', 'Works with no arguments'
		equals fred(1,2,3), 'fred', 'Works with arguments'
		
	test 'argument', ->
	
		equals Function.argument(0).call(this,'red','green','blue'), 'red', 'Function.argument(0) works'
		equals Function.argument(1).call(this,'red','green','blue'), 'green', 'Function.argument(1) works'
		equals Function.argument(2).call(this,'red','green','blue'), 'blue', 'Function.argument(2) works'
		equals Function.argument(4).call(this,'red','green','blue'), undefined, 'Function.argument(4) returns undefined if beyond bounds'
		
		# equals Function.argument(2).hastype('string').call(this,'red','green','blue'), true, 'Function.argument(4).hastype returns false if type does not match'
		# equals Function.argument(2).hastype('number').call(this,'red','green','blue'), false, 'Function.argument(4).hastype returns false if type does not match'
		
	test 'map', ->
	
		counts = Function.map
			quarks: 6
			chargedLeptons: 3
			neutrinos: 3
		
		equals counts('quarks'), 6, 'Works for first mapping entry'
		equals counts('chargedLeptons'), 3, 'Works for other mapping entries'

	test 'pipe', ->

		times2 = (x) -> 2*x
		addten = (x) -> x+10

		equals Function.pipe(times2,addten)(7), 24, 'piping of two functions works'
		equals Function.pipe(addten,times2)(7), 34, 'piping works in opposite direction'
		equals Function.pipe(times2)(7), 14, 'pipe of a single function is just that function'
		equals Function.pipe()(7), 7, 'pipe of no functions is identity'

	test 'compose', ->
	
		times2 = (x) -> 2*x
		addten = (x) -> x+10
			
		equals Function.compose(times2,addten)(7), 34, 'composition of two functions works'
		equals Function.compose(addten,times2)(7), 24, 'composition works in opposite direction'
		equals Function.compose(times2)(7), 14, 'composition of a single function is just that function'
		equals Function.compose()(7), 7, 'composition of no functions is identity'
		
	test 'or', ->
	
		equals Function.or()(5), false, 'or of zero arguments is false'
		equals Function.or(Function.eq(5))(5), true, 'or with one argument returns true when predicate is true'
		equals Function.or(Function.eq(5))(7), false, 'or with one argument returns false when predicate is false'
		
		equals Function.or(Function.eq(5),Function.eq(6))(5), true, 'or with two arguments returns true when first is true'
		equals Function.or(Function.eq(5),Function.eq(6))(6), true, 'or with two arguments returns true when second is true'
		equals Function.or(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'

	test 'and', ->
	
		equals Function.and()(5), true, 'or of zero arguments is true'
		equals Function.and(Function.eq(5))(5), true, 'and with one argument returns true when predicate is true'
		equals Function.and(Function.eq(5))(7), false, 'and with one argument returns false when predicate is false'
		
		equals Function.and(Function.lt(5),Function.lt(6))(3), true, 'and with two arguments returns true when both are true'
		equals Function.and(Function.eq(5),Function.eq(6))(6), false, 'and with two arguments returns false when first is false'
		equals Function.and(Function.eq(5),Function.eq(6))(5), false, 'or with two arguments returns false when second is false'
		equals Function.and(Function.eq(5),Function.eq(6))(7), false, 'or with two arguments returns false when neither is true'

	test 'not', ->
	
		equals Function.not(Function.eq(5))(6), true, 'not returns true when predicate returns false'
		equals Function.not(Function.eq(5))(5), false, 'not returns false when predicate returns true'
	
	test 'ordering', ->
		
	test 'eq', ->
		
		equal Function.eq(5)(5), true, 'returns true when applied to value equal to argument'
		equal Function.eq(5)(3), false, 'returns false when applied to value not equal to argument'
