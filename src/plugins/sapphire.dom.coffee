define (require) ->

	require 'jmodel/sapphire2'
	
	collectionFromSelector =
		(constructor) ->
			(selector) ->
				new constructor document.querySelectorAll selector
	
	Set.Of(Element).fromSelector  = collectionFromSelector Set.Of Element
	List.Of(Element).fromSelector = collectionFromSelector List.Of Element
	
	Document::find = Element::find = (selector) ->
		new ( Set.Of(Element) ) @querySelectorAll selector