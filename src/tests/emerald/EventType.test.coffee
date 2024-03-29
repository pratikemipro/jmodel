	module 'EventType'
	
	delay = (fn) -> setTimeout fn, 50
	
	test 'EventType::subscribe', ->
		
		et = new EventType
		
		subscriber = new Subscriber()

		et.subscribe subscriber
		
		equal et.subscribers[0], subscriber, 'Subscribers are added to subscriber set'
	
	asyncTest 'EventType::add', 1, ->
		
		et = new EventType
		
		output = []
		promise1 = new JMPromise
		promise2 = new JMPromise
		
		et.subscribe -> output.push this
		
		et.add promise1
		et.add promise2
		
		promise1.fulfil 'red'
		promise2.fulfil 'green'
		
		delay ->
			deepEqual output, ['red','green'], 'Raising notifies first subscriber'
			start()
		
	asyncTest 'EventType::raise', 2, ->
		
		et = new EventType
		
		output1 = []
		output2 = []
		
		et.subscribe -> output1.push this
		et.subscribe -> output2.push this
		
		et.raise 'red'
		et.raise 'green'
		
		delay ->
		
			deepEqual output1, ['red','green'], 'Raising notifies first subscriber'
			deepEqual output2, ['red','green'], 'Raising notifies other subscribers'
		
			start()
			
	asyncTest 'EventType::map', 1, ->
		
		numbers = new EventType
		output = []
		
		numbers
			.map -> this*this
			.subscribe -> output.push this
		
		[1,2,3,4].each -> numbers.raise +this
		
		delay ->	
			deepEqual output, [1,4,9,16], 'Mapped events notify correctly'
			start()
			
	asyncTest 'EventType::where', 1, ->
		
		numbers = new EventType
		output = []
		
		numbers
			.where -> this % 2 == 0
			.subscribe -> output.push this
		
		[1,2,3,4].each -> numbers.raise +this
		
		delay ->	
			deepEqual output, [2,4], 'Filtered events notify correctly'
			start()
			
	asyncTest 'EventType::take', 1, ->
		
		numbers = new EventType
		output = []
		
		numbers
			.take 2
			.subscribe -> output.push this
		
		[1,2,3,4].each -> numbers.raise +this
		
		delay ->	
			deepEqual output, [1,2], 'Taken events notify correctly'
			start()
			
	asyncTest 'EventType::drop', 1, ->
		
		numbers = new EventType
		output = []
		
		numbers
			.drop 2
			.subscribe -> output.push this
		
		[1,2,3,4].each -> numbers.raise +this
		
		delay ->	
			deepEqual output, [3,4], 'Dropped events notify correctly'
			start()
			
	asyncTest 'EventType::transition', 1, ->
		
		numbers = new EventType
		output = []
		
		numbers
			.transition()
			.subscribe ->
				output.push this
		
		[1,2,2,2,3,3,4].each -> numbers.raise this
		
		delay ->	
			deepEqual output, [1,2,3,4], 'Transition events notify correctly'
			start()
			
	asyncTest 'EventType.Of', 0, ->
		
		ValueChangeEvent = (@value,@old) ->
		
		et = new (EventType.Of ValueChangeEvent)
		
		et.subscribe ->
			equal this instanceof ValueChangeEvent, true, 'Generates events of right type'
			deepEqual [@value,@old], ['red','green'], 'Passes correct values to constructor'
			start()
			
		et.raise 'red', 'green'