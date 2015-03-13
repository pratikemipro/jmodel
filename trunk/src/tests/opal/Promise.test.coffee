	module 'JMPromise'
	
	test 'JMPromise.then', ->
	
		promise = new JMPromise()
		
		equals promise.then(->) instanceof JMPromise, true, 'Returns a JMPromise'
		
	asyncTest 'onFulfilled', 2, ->
		
		promise = new JMPromise()
		
		promise.then (x,y) ->
			equals x, 'fred', 'onFulfilled called with fulfilment value'
			equals y, 'smith', 'onFulfilled allows multi-part fulfilment values'
			start()
			
		promise.fulfil 'fred', 'smith'
		
	asyncTest 'onRejected', 1, ->
		
		promise = new JMPromise()
		
		promise.then undefined, (x) ->
			equals x, 'fred', 'onRejected called with rejection reason'
			start()
			
		promise.reject 'fred'
	
	test 'JMPromise.fulfil', ->
		
		promise = new JMPromise()
		promise.fulfil 'fred'
		
		raises ( -> promise.fulfil() ), 'Throws exception if fulfiled more than once'
		raises ( -> promise.reject() ), 'Throws exception if rejected after fulfilled'
		
		equals promise.value, 'fred', 'After fulfilment, promise value is fulfilment value'
		equals promise.reason, undefined, 'After fulfulment, promise reason is undefined'
	
	test 'JMPromise.reject', ->
		
		promise = new JMPromise()
		promise.reject 'fred'
		
		raises ( -> promise.reject() ), 'Throws exception if rejected more than once'
		raises ( -> promise.fulfil() ), 'Throws exception if fulfilled after rejected'
		
		equals promise.value, undefined, 'After rejection, promise value is undefined'
		equals promise.reason, 'fred', 'After rejection, promise reason is rejection reason'
		
	asyncTest 'JMPromise.Fulfilled', 2, ->
		
		promise = JMPromise.Fulfilled 'red'
		
		promise.then (value) ->
			equals promise instanceof JMPromise, true, 'Already fulfilled promises are promises'
			equals value, 'red', 'JMPromise fulfilled with correct value'
			start()
			
	asyncTest 'JMPromise.Rejected', 2, ->
		
		promise = JMPromise.Rejected 'red'
		
		promise.then (->), (value) ->
			equals promise instanceof JMPromise, true, 'Already rejected promises are promises'
			equals value, 'red', 'JMPromise rejected with correct value'
			start()
		
	asyncTest 'JMPromise.Of', 2, ->
		
		promise = new (JMPromise.Of Date)

		promise.then (value) ->
			equals value instanceof Date, true, 'Creates object of correct type'
			equals value.toDateString(), 'Wed Nov 20 1974', 'Passes arguments correctly'
			start()
		
		promise.fulfil '1974-11-20'
		
	asyncTest 'JMPromise.Of.Fulfilled', 2, ->
		
		promise = JMPromise.Of(Date).Fulfilled '1974-11-20'
		
		promise.then (value) ->
			equals value instanceof Date, true, 'Creates object of correct type'
			equals value.toDateString(), 'Wed Nov 20 1974', 'Passes arguments correctly'
			start()
			
	asyncTest 'JMPromise.Of.Rejected', 1, ->
		
		promise = JMPromise.Of(Date).Rejected 'error'
		
		promise.then (->), (value) ->
			equals value, 'error', 'Passes argument correctly'
			start()
			
	asyncTest 'JMPromise.conjoin', 2, ->
		
		delay = (fn) -> setTimeout fn, 100
		
		promise1 = new JMPromise
		promise2 = new JMPromise
		promise3 = new JMPromise
		
		promise = JMPromise.conjoin promise1, promise2, promise3
		
		equals promise instanceof JMPromise, true, 'A conjunction of promises is a promise'
		
		output = []
		
		promise.then (values...) -> output = values
		
		promise1.fulfil 'red'
		promise2.fulfil 'green'
		promise3.fulfil 'blue'
		
		delay ->
			deepEqual output, ['red','green','blue'], 'Conjunction fulfilled with all fulfilled values'
			start()
		
	asyncTest 'JMPromise.disjoin', 2, ->
		
		delay = (fn) -> setTimeout fn, 100
		
		promise1 = new JMPromise
		promise2 = new JMPromise
		promise3 = new JMPromise
		
		promise = JMPromise.disjoin promise1, promise2, promise3
		
		equals promise instanceof JMPromise, true, 'A disjunction of promises is a promise'
		
		output = []
		
		promise.then (value) -> output.push value
		
		promise2.fulfil 'green'
		promise1.fulfil 'red'
		
		delay ->
			deepEqual output, ['green'], 'Disjunction fulfilled with first fulfilled value only'
			start()
			
	asyncTest 'JMPromise.Of.disjoin', 3, ->
		
		delay = (fn) -> setTimeout fn, 100
		
		promise1 = new JMPromise
		promise2 = new JMPromise
		promise3 = new JMPromise
		
		promise = JMPromise.Of(Date).disjoin promise1, promise2, promise3
		
		equals promise instanceof JMPromise, true, 'A typed disjunction of promises is a promise'
		
		output = []
		
		promise.then (value) -> output.push value
		
		promise2.fulfil '1974-11-20'
		promise1.fulfil '1979-1-14'
		
		delay ->
			equal output[0] instanceof Date, true, 'Constructor correctly applied'
			deepEqual (date.toDateString() for date in output), ['Wed Nov 20 1974'], 'Disjunction fulfilled with first fulfilled value only'
			start()
		