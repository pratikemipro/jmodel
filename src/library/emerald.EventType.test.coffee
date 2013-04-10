	module 'EventType'
	
	test 'EventType::subscribe', ->
		
		et = new EventType()
		
		subscriber = new Subscriber()

		et.subscribe subscriber
		
		equal et.subscribers[0], subscriber, 'Subscribers are added to subscriber set'