define (require) ->

	require 'jmodel/sapphire2'

	query = (selector) -> switch
		when selector.charAt(0) == '>'
			( child for child in @children when child.matches selector[2..] )
		else
			@querySelectorAll selector
	
	##
	## Find elements within documents or elements
	##
	
	Document::find =
	Element::find =
		Function.From(String) (selector) ->
			new ( Set.Of Element ) query.call this, selector
			
	##
	## Find elements from selector without context
	##
	
	Set.Of(Element).fromSelector =
	List.Of(Element).fromSelector =
		Function.From(String) (selector) ->
			document.find selector
			
	##
	## Find elements within elements in collection
	##		
					
	Set.Of(Element)::find =
	List.Of(Element)::find =
		Function.From(String) (selector) ->
			new @constructor @mapAll -> query.call this, selector
	