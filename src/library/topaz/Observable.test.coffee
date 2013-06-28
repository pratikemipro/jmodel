	module 'Observable'
	
	asyncTest '(Observable Set)::add', 1, ->
		
		delay = (fn) -> setTimeout fn, 1
		
		set = new (Observable Set)
		
		items = []
		
		set.event('add').subscribe (item) -> items.push item
		
		set.add(1).add(1).add(2).add(3).add(2).add(4).add(1).add(5).add(6)
		
		delay ->
			deepEqual items, [1,2,3,4,5,6], 'Raises correct events on addition'
			start()
			
	asyncTest '(Observable Set)::remove', 1, ->
		
		delay = (fn) -> setTimeout fn, 1
		
		set = new (Observable Set) [1, 2, 3, 4, 5, 6]
		
		items = []
		
		set.event('remove').subscribe (item) -> items.push item
		
		set.remove(Number.Odd.valid)
		
		delay ->
			deepEqual items, [1,3,5], 'Raises correct events on addition'
			start()
			
	asyncTest '(Observable List)::add', 1, ->
		
		delay = (fn) -> setTimeout fn, 1
		
		list= new (Observable List)
		
		items = []
		
		list.event('add').subscribe (item) -> items.push item
		
		list.add(1).add(1).add(2).add(3).add(2).add(4).add(1).add(5).add(6)
		
		delay ->
			deepEqual items, [1,1,2,3,2,4,1,5,6], 'Raises correct events on addition'
			start()