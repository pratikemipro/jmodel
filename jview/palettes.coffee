define [ 'jquery', 'jmodel/emerald' ], ($,jm) ->
	
	class Palettes
	
		constructor: (dl,@parameters,@constructors) ->
			
			@dl = $ dl
			
			@palettes = ( new constructor @dl.children('dd').filter(className), this ) for className, constructor of @constructors
			
			@dl.children('dt').event('click').subscribe ({target}) =>
				$(target).closest('dt').toggleClass 'open'
				
	return {
		Palettes: Palettes
	}