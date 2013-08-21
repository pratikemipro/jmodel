	module 'Stream'
	
	test 'Stream::add', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		stream.each -> output1.push this
		
		stream.each -> output2.push "<#{this}>"
		
		stream.add('red').add('green').add('blue')
		
		deepEqual output1, ['red','green','blue'], 'Items added to stream are passed to each'
		deepEqual output2, ['<red>','<green>','<blue>'], 'Allows multiple each callbacks'
	
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
	
	test 'Stream::map', ->
		
		stream = new Stream()
		output = []
		
		stream.map(-> 1 == @mod 2).each (item) -> output.push item
		
		stream.add(1).add(2).add(3).add(4).add(5).add(6)
		
		deepEqual output, [true,false,true,false,true,false], 'Correctly applies map'
	
	test 'Stream::where', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		stream.each -> output1.push this
		
		stream.where(-> 1 == @mod 2).each -> output2.push this
		
		stream.add(1).add(2).add(3).add(4).add(5).add(6)
		
		deepEqual output1, [1,2,3,4,5,6], 'Behaviour of base stream is unaffected'
		deepEqual output2, [1,3,5], 'Derived stream only includes first n items'
		
	test 'Stream::take', ->
		
		stream = new Stream()
		output1 = []
		output2 = []
		
		stream.each -> output1.push this
		
		stream.take(3).each -> output2.push this
		
		stream.add('red').add('green').add('blue').add('cyan').add('magenta').add('yellow')
		
		deepEqual output1, ['red','green','blue','cyan','magenta','yellow'], 'Behaviour of base stream is unaffected'
		deepEqual output2, ['red','green','blue'], 'Derived stream only includes first n items'
		
	test 'Stream::drop', ->
	
		stream = new Stream()
		output1 = []
		output2 = []
	
		stream.each -> output1.push this
	
		stream.drop(3).each -> output2.push this
	
		stream.add('red').add('green').add('blue').add('cyan').add('magenta').add('yellow')
	
		deepEqual output1, ['red','green','blue','cyan','magenta','yellow'], 'Behaviour of base stream is unaffected'
		deepEqual output2, ['cyan','magenta','yellow'], 'Derived stream does not include first n items'
	
	test 'Stream::transition', ->
		
		stream = new Stream()
		output = []
		
		stream.transition().each -> output.push this
		
		stream.add(3).add(3).add(3).add(2).add(5).add(5).add(1)
		
		deepEqual output, [3,2,5,1], 'Transition stream only contains distinct values'
		
		output = []
		
		stream.add(false).add(false).add(false).add(true).add(false).add(true).add(true)
		
		deepEqual output, [false,true,false,true], 'Transition works for Boolean values'
		
	test 'Stream::control', ->
		
		data    = new Stream()
		control = new Stream()

		output = []
		data.control(control).each -> output.push this
		
		data.add 'red'
		data.add 'green'
		control.add false
		data.add 'blue'
		data.add 'cyan'
		control.add true
		data.add 'magenta'
		control.add false
		data.add 'yellow'
		
		deepEqual output, ['red','green','magenta'], 'Control stream gates output'
		
	test 'Stream::between', ->
		
		data  = new Stream()
		start = new Stream()
		stop  = new Stream()
		
		output = []
		data.between(start,stop).each -> output.push this
		
		data.add 'red'
		data.add 'green'
		stop.add 16
		data.add 'blue'
		data.add 'cyan'
		start.add 'fred'
		start.add 'smith'
		data.add 'magenta'
		stop.add false
		data.add 'yellow'
		
		deepEqual output, ['red','green','magenta'], 'Start and stop streams open and close gate'
		
	test 'Stream::accumulate', ->
		
		numbers = new Stream()
		
		output = []
		numbers.accumulate(Math.plus).each -> output.push this
		
		numbers.add(1).add(2).add(3).add(4).add(5).add(6)
		
		deepEqual output, [1,3,6,10,15,21], 'Accumulates correctly'
		
		numbers = new Stream()
		
		output = []
		numbers.accumulate(Math.plus,10).each -> output.push this
		
		numbers.add(1).add(2).add(3).add(4).add(5).add(6)
		
		deepEqual output, [11,13,16,20,25,31], 'Starts with initial value'
		
	test 'Stream.disjoin', ->
		
		colours1 = new Stream()
		colours2 = new Stream()
		
		output = []
		Stream.disjoin(colours1,colours2).each -> output.push this
		
		colours1.add 'red'
		colours2.add 'cyan'
		colours1.add 'green'
		colours2.add 'magenta'
		colours1.add 'blue'
		colours2.add 'yellow'
		
		deepEqual output, ['red','cyan','green','magenta','blue','yellow'], 'Correctly disjoins streams'