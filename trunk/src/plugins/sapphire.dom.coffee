define (require) ->

	require 'jmodel/sapphire2'
	
	##
	## Implicit construction of elements
	##
	
	makeElement = Function.From(String) (html) ->
		{childNodes:[element]} = Object.execute(-> @innerHTML = html) document.createElement 'div'
		return element
	
	Set.Of(Element)::add =
		(str) -> Set::add.call this, if str instanceof Element then str else makeElement str
	
	List.Of(Element)::add =
		(str) -> List::add.call this, if str instanceof Element then str else makeElement str
	

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
	
	context = (property) -> Function.overload [
		
		Function.From() ->
			@to(List).map -> this[property]
		
		Function.From(String) (name) ->
			@to(List).map -> this[property][name]
	
		Function.From(Function) (fn) ->
			@each -> Object.execute(fn) this[property]
	
	]
	
	Set.Of(Element)::style =
	List.Of(Element)::style =
		context('style').extend [
			
			Function.From() ->
				@to(List).map -> window.getComputedStyle this
			
			Function.From(String) (name) ->
				@style().map -> this[name]
				
		]
	
	Set.Of(Element)::dataset =
	List.Of(Element)::dataset =
		context 'dataset'
		
	Set.Of(Element)::classes =
	List.Of(Element)::classes =
		context('classList').extend [
		
			Function.From(String) (name) ->
				@classes().map -> @contains name
		
		]
		
	getAttributes =
		Function.Returning(-> {}) (attributes) -> ->
			attributes[attr.name] = attr.value for attr in @attributes
	
	Set.Of(Element)::attributes =
	List.Of(Element)::attributes =
		Function.overload [
		
			Function.From() ->
				@to(List).map getAttributes
				
			Function.From(String) (name) ->
				@attributes().map -> this[name]
				
			Function.From(Function) (fn) ->
				@each ->
					for own name, value of Object.execute(fn) getAttributes.call this
						if value? and value then @setAttribute name, value else @removeAttribute name
		
		]