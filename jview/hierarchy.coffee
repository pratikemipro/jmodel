define ['jquery','jmodel/topaz'], ($,jm) ->

	##
	## Node
	##
	
	class Node
		
		constructor: ({@title, @href, @tail}) ->
	
	##
	## View
	##
	
	class View
		
		constructor: (element) ->
			@element = $ element
			
		renderNodes: (node) ->
			@element.children('li:gt(2)').remove()
			@renderNode node
			
		renderNode: (node) ->
			@element.append \
				$('<li/>').append \
					$('<a/>').attr('href',node.href).text(node.title)
			if node.tail then @renderNode node.tail 
	

	##
	## Return constructors
	##
			
	return {
		Node: Node
		View: View
	}