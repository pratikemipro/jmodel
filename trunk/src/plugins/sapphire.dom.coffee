define (require) ->

	require 'jmodel/sapphire2'

	##
	## General querying within object
	##

	query = (selector) -> switch
		when selector.charAt(0) == '>'
			( child for child in @children when child.matches selector[2..] )
		when selector.charAt(0) == '<'
			ancestors = do (parent = this) -> while parent.parentNode?
				parent = parent.parentNode
			( ancestor for ancestor in ancestors when ancestor.matches? selector[2..] )
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
	
	##
	## Shorthands
	##
	
	Set.Of(Element)::style =
	List.Of(Element)::style =
		Function.From(Function) (fn) ->
			@each -> fn.call @style
	
	Set.Of(Element)::data =
	List.Of(Element)::data =
		Function.From(Function) (fn) ->
			@each -> fn.call @dataset
	