	module 'Promise'
	
	test 'Promise.fulfil', ->
		
		promise = new Promise()
		promise.fulfil()
		
		raises ( -> promise.fulfil() ), 'Throws exception if fulfiled more than once'
		raises ( -> promise.reject() ), 'Throws exception if rejected after fulfilled'
	
	test 'Promise.reject', ->
		
		promise = new Promise()
		promise.reject()
		
		raises ( -> promise.reject() ), 'Throws exception if rejected more than once'
		raises ( -> promise.fulfil() ), 'Throws exception if fulfilled after rejected'
		
		