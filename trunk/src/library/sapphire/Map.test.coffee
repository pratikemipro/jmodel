	module 'Map'
	
	test 'Map constructor', ->
		
		falls = new Map
			rome: 476
			constantinople: 1453
			
		deepEqual ( key for own key of falls ), ['rome','constantinople'], 'Map has correct keys'
		
		deepEqual [falls['rome'],falls['constantinople']], [476,1453], 'Keys map to correct values'
		
		empty = new Map()
		
		equals empty instanceof Map, true, 'Empty maps are valid'