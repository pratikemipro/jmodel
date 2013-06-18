	module 'Map'
	
	test 'Map constructor', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		deepEqual ( key for own key of falls ), ['rome','constantinople'], 'Map has correct keys'
		
		deepEqual [falls['rome'],falls['constantinople']], [476,1453], 'Keys map to correct values'
		
		empty = new Map()
		
		equals empty instanceof Map, true, 'Empty maps are valid'
		
	test 'Map::remove', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		falls.remove 'rome'
		
		deepEqual ( key for own key of falls ), ['constantinople'], 'Correctly removes key'
		equal falls.get('constantinople'), 1453, 'Remaining key mappings unchanged'
		
	test 'Map::keys', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		cities = falls.keys()
		
		equal cities instanceof Set, true, 'Returns a Set'
		deepEqual ( city for city in cities ).sort(), ['constantinople','rome'], 'Returns correct keys'
		
	test 'Map.To', ->
		
		falls = new (Map.To Date)
			rome: '476-9-4'
			constantinople: '1453-5-29'
			
		equal falls.get 'rome' instanceof Date, true, 'Converts values to correct type'
		equal falls.get('rome').toDateString(), 'Fri Sep 04 476', 'Mapped values are correct'