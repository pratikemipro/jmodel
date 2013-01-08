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