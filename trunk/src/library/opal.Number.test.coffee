	module 'Number'
	
	test 'Integer', ->
		
		equals Integer(5), 5, 'Returns the integer value when called on an integer.'
		throws Integer(5.5), 'Throws an exception when called on a non-integer'