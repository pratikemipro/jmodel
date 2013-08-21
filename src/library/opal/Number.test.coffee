	module 'Number'
	
	test 'Number::equals', ->
		
		num = 3
		
		equals num.equals(2), false, 'Returns false if argument is not equal to number'
		equals num.equals(3), true, 'Returns true if argument is equal to number'
		raises ( -> num.equals 'red'), 'Throws an exception when called with a non-number'
	
	test 'Number::plus', ->
		
		num = 3
		
		equals num.plus(2), 5, 'Returns sum of argument and number'
		raises ( -> num.plus 'red'), 'Throws an exception when called with a non-number'
	
	test 'Number::minus', ->
		
		num = 3
		
		equals num.minus(2), 1, 'Returns difference of argument and number'
		raises ( -> num.minus 'red'), 'Throws an exception when called with a non-number'
	
	test 'Number::times', ->
		
		num = 3
		
		equals num.times(2), 6, 'Returns product of argument and number'
		raises ( -> num.times 'red'), 'Throws an exception when called with a non-number'
	
	test 'Number::div', ->
		
		num = 3
		
		equals num.div(2), 1.5, 'Returns quotient of argument and number'
		raises ( -> num.div 'red'), 'Throws an exception when called with a non-number'
	
	test 'Number::mod', ->
		
		num = 3
		
		equals num.mod(2), 1, 'Returns number modulo argument'
		raises ( -> num.mod 'red'), 'Throws an exception when called with a non-number'
	
	test 'Integer', ->
		
		equals Number.Integer(5), 5, 'Returns the integer value when called on an integer.'
		raises ( -> Number.Integer(5.5) ), 'Throws an exception when called on a non-integer'