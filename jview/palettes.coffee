define [ 'jquery', 'jmodel/emerald' ], ($,jm) ->
	
	class Palettes
	
		constructor: (dl,@parameters,@constructors) ->
			
			@dl = $ dl
			
			@palettes = ( new constructor this, className ) for className, constructor of @constructors
			
			@dl.children('dt').event('click').subscribe ({target}) =>
				$(target).closest('dt').toggleClass 'open'
				
	return {
		Palettes: Palettes
	}