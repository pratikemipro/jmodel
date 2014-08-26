	module 'EventType'
	
	delay = (fn) -> setTimeout fn, 50
	
	test 'EventType::subscribe', ->
		
		et = new EventType()
		
		subscriber = new Subscriber()

		et.subscribe subscriber
		
		equal et.subscribers[0], subscriber, 'Subscribers are added to subscriber set'
	
	asyncTest 'EventType::add', 1, ->
		
		et = new EventType()
		
		output = []
		promise1 = new Promise()
		promise2 = new Promise()
		
		et.subscribe (x) -> output.push x
		
		et.add promise1
		et.add promise2
		
		promise1.fulfil 'red'
		promise2.fulfil 'green'
		
		delay ->
			deepEqual output, ['red','green'], 'Raising notifies first subscriber'
			start()
		
	asyncTest 'EventType::raise', 2, ->
		
		et = new EventType()
		
		output1 = []
		output2 = []
		
		et.subscribe (x) -> output1.push x
		et.subscribe (x) -> output2.push x
		
		et.raise 'red'
		et.raise 'green'
		
		delay ->
		
			deepEqual output1, ['red','green'], 'Raising notifies first subscriber'
			deepEqual output2, ['red','green'], 'Raising notifies other subscribers'
		
			start()
			
	asyncTest 'EventType::where', 1, ->
		
		numbers = new EventType()
		output = []
		
		numbers
			.where -> this % 2 == 0
			.subscribe (x) -> output.push x
		
		numbers.raise 1
		numbers.raise 2
		numbers.raise 3
		numbers.raise 4
		
		delay ->	
			deepEqual output, [2,4], 'Derived events notify correctly'
			start()
			
	asyncTest 'EventType.Of', 0, ->
		
		ValueChangeEvent = (@value,@old) ->
		
		et = new (EventType.Of ValueChangeEvent)
		
		et.subscribe (event) ->
			equal event instanceof ValueChangeEvent, true, 'Generates events of right type'
			deepEqual [event.value,event.old], ['red','green'], 'Passes correct values to constructor'
			start()
			
		et.raise 'red', 'green'
			