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