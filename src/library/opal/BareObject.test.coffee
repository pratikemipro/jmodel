	module 'Bare objects'
	
	test 'Object.equal', ->
	
		equals Object.equal({name:'fred',age:20},{name:'fred',age:20}), true, 'Returns true if objects have same properties and property valeus'
		
		equals Object.equal({name:'fred',age:20},{name:'fred'}), false, 'Returns false if first object has a property that second does not have'
		equals Object.equal({name:'fred'},{name:'fred',age:20}), false, 'Returns false if second object has a property that second does not have'
		equals Object.equal({name:'fred',age:20},{name:'fred',age:25}), false, 'Returns false if objects have same properties but different property valeus'
	
	test 'Object.remove', ->
	
		removeProperties = Object.remove 'age', 'surname'
		
		equals removeProperties(forename:'fred',surname:'smith',age:20).age, undefined, 'Removes first listed property'
		equals removeProperties(forename:'fred',surname:'smith',age:20).surname, undefined, 'Removes second listed property'
		equals removeProperties(forename:'fred',surname:'smith',age:20).forename, 'fred', 'Leaves other properties unchanged'

	test 'project', ->
	
		projectProperties = Object.project 'age', 'surname'
		
		equals projectProperties(forename:'fred',surname:'smith',age:20).age, 20, 'Preserves first listed property'
		equals projectProperties(forename:'fred',surname:'smith',age:20).surname, 'smith', 'Preserves other listed properties'
		equals projectProperties(forename:'fred',surname:'smith',age:20).forename, undefined, 'Removes other listed properties'
		
	test 'rename', ->
	
		renameProperties = Object.rename
			forename: 'personalName'
			surname: 'familyName'
		
		equals renameProperties(forename:'fred',surname:'smith',age:20).forename, undefined, 'Old name of first renamed property unavailable'
		equals renameProperties(forename:'fred',surname:'smith',age:20).surname, undefined, 'Old name of second renamed property unavailable'
		
		equals renameProperties(forename:'fred',surname:'smith',age:20).personalName, 'fred', 'New name of first renamed property available'
		equals renameProperties(forename:'fred',surname:'smith',age:20).familyName, 'smith', 'New name of second renamed property available'
		
		equals renameProperties(forename:'fred',surname:'smith',age:20).age, 20, 'Other properties preserved'
		
	test 'union', ->
	
		a = 
			forename: 'fred'
			surname: 'smith'
		
		b = 
			surname: 'jones'
			age: 20
		
		c =
			department: 'IT'
		
		
		d = Object.union a, b, c
		
		equals d.forename, 'fred', 'Union has property possed only by first object'
		equals d.age, 20, 'Union has property possed only by second object'
		equals d.department, 'IT', 'Union has property possed only by third object'
		notEqual d.surname, undefined, 'Union has shared property'
		equals d.surname, 'jones', 'Later objects supercede earlier ones for shared property values'
		
		deepEqual Object.union(a), a, 'Union of single object is a copy of that object'
		deepEqual Object.union(), {}, 'Union of no objects is undefined'
		
	test 'intersection', ->
		
		a =
			forename: 'fred'
			surname: 'smith'
			age: 20
			title: 'Mr'
			
		b =
			forename: 'fred'
			surname: 'jones'
			age: 20
			status: 'Employee'
			
		c =
			forename: 'fred'
			surname: 'jones'
			department: 'IT'
			
		d = Object.intersection a, b, c

		equal d.age, undefined, 'Properties not shared by all objects are undefined'
		equal d.department, undefined, 'Properties not shared by all objects are undefined'
	
		notEqual d.forename, undefined, 'Properties shared by all objects exist in intersection'
		notEqual d.surname, undefined, 'Properties shared by all objects exist in intersection'
	
		equal d.forename, 'fred', 'Property has same value in intersection if all objects have same value'
		equal d.surname, 'smith', 'Earlier objects supercede earlier ones for shared property values'
	
		deepEqual Object.intersection(a), a, 'Intersection of single object is a copy of that object'
		deepEqual Object.intersection(), {}, 'Intersection of no objects is undefined'
		
	test 'difference', ->
		
		a =
			forename: 'john'
			surname: 'smith'
			age: 20
			title: 'Mr'
			
		b =
			forename: 'fred'
			surname: 'jones'
			department: 'IT'
			
		c = Object.difference a, b
		
		equal c.age, 20, 'Properties not defined in second object are preserved'
		equal c.forename, undefined, 'Properties defined in second object are removed'
		
	test 'join', ->
		
		onid = (a,b) -> a.id == b.id
		
		a =
			id: 1
			name: 'fred'
			age: 20
			
		b =
			id: 1
			department: 'IT'
			
		c =
			id: 2
			department: 'Finance'
			
		d = Object.join(onid) a, b
		e = Object.join(onid) a, c
		
		equal e, undefined, 'Join is undefined if pair of objects does not match predicate'
		deepEqual d, Object.union(a,b), 'Join is union if objects match predicate'
		