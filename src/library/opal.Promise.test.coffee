	module 'Promise'
	
	test 'Promise.fulfil', ->
		
		promise = new Promise()
		promise.fulfil()
		
		raises ( -> promise.fulfil() ), 'Throws exception if fulfiled more than once'
		