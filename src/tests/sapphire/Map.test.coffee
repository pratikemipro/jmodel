	module 'Map'
	
	test 'Map constructor', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		deepEqual ( key for own key of falls._ ), ['rome','constantinople'], 'Map has correct keys'
		
		deepEqual [falls._['rome'],falls._['constantinople']], [476,1453], 'Keys map to correct values'
		
		empty = new Map()
		
		equals empty instanceof Map, true, 'Empty maps are valid'
		
	test 'Map::remove', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		falls.remove 'rome'
		
		deepEqual ( key for own key of falls._ ), ['constantinople'], 'Correctly removes key'
		equals falls.get('constantinople'), 1453, 'Remaining key mappings unchanged'
		
	test 'Map::keys', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		cities = falls.keys()
		
		equals cities instanceof Set, true, 'Returns a Set'
		deepEqual ( city for city in cities ).sort(), ['constantinople','rome'], 'Returns correct keys'
		
	test 'Map.To', ->
		
		falls = new (Map.To Date)
			rome: '476-9-4'
			constantinople: '1453-5-29'
		
		equals falls.get('rome') instanceof Date, true, 'Converts values to correct type'
		equals falls.get('rome').toDateString(), 'Fri Sep 04 476', 'Mapped values are correct'
		
		DateMap1 = Map.To Date
		DateMap2 = Map.To Date
		
		equals DateMap1, DateMap2, 'Typed Map constructor cached correctly'
		
		equals (Map.To Date), (Map.To Date), 'Map.To cached correctly'
		
	test 'Map.Using', ->
		
		scores = new (Map.Using Math.plus)
			england: 0
			france: 0
			
		scores.add 'england', 3
		scores.add 'france', 2
		scores.add 'england', 5
		scores.add 'france', 3
		
		deepEqual [scores.get('england'),scores.get('france')], [8,5], 'Combines values correctly'
		
		departments = new (Map.To(Set).Using Set.union)
		
		departments.add 'IT', 'Richard'
		departments.add 'Finance', 'Michael'
		departments.add 'IT', 'Jonathan'
		departments.add 'Finance', 'Rachel'
		
		equals departments.get('IT') instanceof Set, true, 'Converts values to correct type'
		deepEqual (person for person in departments.get('IT')).sort(), ['Jonathan','Richard'], 'Combines values correctly'
		
		equals (Map.To(Set).Using Set.union), (Map.To(Set).Using Set.union), 'Map.Using cached correctly'