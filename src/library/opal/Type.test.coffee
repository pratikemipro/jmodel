	module 'Type'
	
	test 'Type.union', ->
		
		Tree = Type.union
			Branch: (@left,@right) ->
			Node: (@value) ->
			
		red   = new Tree.Node 'red'
		green = new Tree.Node 'green'
		
		tree = new Tree.Branch red, green
		
		equals red.value, 'red', 'Correct arguments passed to member constructor'
		equals red instanceof Tree.Node, true, 'Member has correct type'
		equals red instanceof Tree, true, 'Inheritance set up correctly'
		
		deepEqual [ tree.left == red, tree.right == green ], [true,true], 'Correct arguments passed to member constructor'
		equals tree instanceof Tree.Branch, true, 'Member has correct type'
		equals tree instanceof Tree, true, 'Inheritance set up correctly'
		