	module 'Nullable'
	
	test 'Nullable Number', ->
		
		equals (Nullable Number)(null), null, 'Returns null when called on null.'
		equals (Nullable Number)(5), 5, 'Throws an exception when called on a non-integer'