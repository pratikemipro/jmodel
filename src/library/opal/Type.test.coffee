	module 'Type'
	
	test 'Type.union', ->
		
		Tree = Type.union ->
			Empty: ->	
			Branch: Function.From(this,this) (@left,@right) ->
			Leaf: (@value) ->
			
		red   = new Tree.Leaf 'red'
		green = new Tree.Leaf 'green'
		
		tree = new Tree.Branch red, green
		
		equals red.value, 'red', 'Correct arguments passed to member constructor'
		equals red instanceof Tree.Leaf, true, 'Member has correct type'
		equals red instanceof Tree, true, 'Inheritance set up correctly'
		
		deepEqual [ tree.left == red, tree.right == green ], [true,true], 'Correct arguments passed to member constructor'
		equals tree instanceof Tree.Branch, true, 'Member has correct type'
		equals tree instanceof Tree, true, 'Inheritance set up correctly'