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
	
	test 'Stream::where', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		odd = (x) -> x % 2 == 1
		
		stream.each (obj) -> output1.push obj
		
		stream.where(odd).each (obj) -> output2.push obj
		
		stream.add(1).add(2).add(3).add(4).add(5).add(6)
		
		deepEqual output1, [1,2,3,4,5,6], 'Behaviour of base stream is unaffected'
		deepEqual output2, [1,3,5], 'Derived stream only includes first n items'
		
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
	
	test 'Stream::transition', ->
		
		stream = new Stream()
		output = []
		
		stream.transition().each (obj) -> output.push obj
		
		stream.add(3).add(3).add(3).add(2).add(5).add(5).add(1)
		
		deepEqual output, [3,2,5,1], 'Transition stream only contains distinct values'
		
		output = []
		
		stream.add(false).add(false).add(false).add(true).add(false).add(true).add(true)
		
		deepEqual output, [false,true,false,true], 'Transition works for Boolean values'
		
	test 'Stream.Of', ->
		
		Person = (@name) ->
		
		stream = new (Stream.Of Person)
		output = []
		
		stream.each (person) -> output.push person
		
		stream.add(new Person('fred')).add('john')
		
		[fred,john] = output
		
		equal stream instanceof Stream, true, 'Typed Streams are Streams'
		equal fred instanceof Person and john instanceof Person, true, 'Objects in stream are of correct type'
		equal john.name, 'john', 'Passes arguments to constructors correctly'