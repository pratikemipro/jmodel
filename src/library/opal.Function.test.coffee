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
