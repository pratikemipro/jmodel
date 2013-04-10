	module 'Stream'
	
	test 'Stream::add', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		stream.each (obj) -> output1.push obj
		
		stream.each (obj) -> output2.push "<#{obj}>"
		
		stream.add('red').add('green').add('blue')
		
		deepEqual output1, ['red','green','blue'], 'Items added to stream are passed to each'
		deepEqual output2, ['<red>','<green>','<blue>'], 'Allows multiple each callbacks'
		
	test 'Stream::take', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		stream.each (obj) -> output1.push obj
		
		stream.take(3).each (obj) -> output2.push obj
		
		stream.add('red').add('green').add('blue').add('cyan').add('magenta').add('yellow')
		
		deepEqual output1, ['red','green','blue','cyan','magenta','yellow'], 'Behaviour of base stream is unaffected'
		deepEqual output2, ['red','green','blue'], 'Derived stream only includes first n items'
		
	test 'Stream::drop', ->
	
		stream = new Stream()
		output1 = []
		output2 = []
	
		stream.each (obj) -> output1.push obj
	
		stream.drop(3).each (obj) -> output2.push obj
	
		stream.add('red').add('green').add('blue').add('cyan').add('magenta').add('yellow')
	
		deepEqual output1, ['red','green','blue','cyan','magenta','yellow'], 'Behaviour of base stream is unaffected'
		deepEqual output2, ['cyan','magenta','yellow'], 'Derived stream does not include first n items'