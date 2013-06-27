	module 'Number'
	
	test 'Integer', ->
		
		equals Number.Integer(5), 5, 'Returns the integer value when called on an integer.'
		raises ( -> Number.Integer(5.5) ), 'Throws an exception when called on a non-integer'