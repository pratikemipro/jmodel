	module 'Promise'
	
	test 'Promise.fulfil', ->
		
		promise = new Promise()
		promise.fulfil 'fred'
		
		raises ( -> promise.fulfil() ), 'Throws exception if fulfiled more than once'
		raises ( -> promise.reject() ), 'Throws exception if rejected after fulfilled'
		
		equals promise.value, 'fred', 'After fulfilment, promise value is fulfilment value'
		equals promise.reason, undefined, 'After fulfulment, promise reason is undefined'
	
	test 'Promise.reject', ->
		
		promise = new Promise()
		promise.reject 'fred'
		
		raises ( -> promise.reject() ), 'Throws exception if rejected more than once'
		raises ( -> promise.fulfil() ), 'Throws exception if fulfilled after rejected'
		
		equals promise.value, undefined, 'After rejection, promise value is undefined'
		equals promise.reason, 'fred', 'After rejection, promise reason is rejection reason'
		
		