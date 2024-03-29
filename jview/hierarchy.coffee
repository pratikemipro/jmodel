define 'jview/hierarchy', (require) ->

	$	= require 'jquery'
	jm	= require 'jmodel/topaz'

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
			
		renderNodes: (node,preserve) ->
			@element.children('li').filter((index) -> index >= preserve).remove()
			@renderNode node
			
		renderNode: (node) ->
			if node
				@element.append \
					$('<li/>').append \
						$('<a class="singleton"/>').attr('href',node.href).text(node.title)
				if node.tail then @renderNode node.tail 
	

	##
	## Return constructors
	##
			
	return {
		Node: Node
		View: View
	}