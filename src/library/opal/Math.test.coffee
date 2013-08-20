	module 'Math'
	
	test 'Math.plus', ->
		
		equals Math.plus(), 0, 'Returns zero for no arguments'
		equals Math.plus(3), 3, 'Returns argument for one argument'
		equals Math.plus(3,2), 5, 'Returns sum of arguments for two arguments'
		
	test 'Math.sum', ->
		
		equals Math.sum(), 0, 'Returns zero for no arguments'
		equals Math.sum(3), 3, 'Returns argument for one argument'
		equals Math.sum(3,2), 5, 'Returns sum of arguments for two arguments'
		equals Math.sum(3,5,2,4), 14, 'Sums list of more than two numbers'

	test 'Math.times', ->
		
		equals Math.times(), 1, 'Returns one for no arguments'
		equals Math.times(3), 3, 'Returns argument for one argument'
		equals Math.times(3,2), 6, 'Returns product of arguments for two arguments'
	
	test 'Math.product', ->
	
		equals Math.product(), 1, 'Returns one for no arguments'
		equals Math.product(3), 3, 'Returns argument for one argument'
		equals Math.product(3,2), 6, 'Returns product of arguments for two arguments'
		equals Math.product(3,5,2,4), 120, 'Returns product of list of more than two numbers'