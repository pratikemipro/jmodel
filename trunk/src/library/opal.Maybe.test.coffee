	module 'Maybe'
	
	test 'Maybe Number', ->
		
		type = Maybe Number
		
		equals type(), undefined, 'Returns undefined when called with no arguments.'
		equals type(undefined), undefined, 'Returns undefined when called with undefined'
		equals type(5), 5, 'Returns value when called with value of correct type'
		
		equals type.valid(undefined), true, 'Undefined is a valid value'
		equals type.valid(5), true, 'Values from base type are valid'
		equals type.valid('red'), false, 'Values not from base type are not valid'