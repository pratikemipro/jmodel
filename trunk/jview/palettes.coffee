define [ 'jquery', 'jmodel/topaz' ], ($,jm) ->
	
	class Palettes
	
		constructor: (dl,@parameters,@constructors) ->
			
			@dl = $ dl
			@dt = @dl.children 'dt'
			
			@state = new jm.ObservableObject
				current: Number,
				{repeat: true}
			
			@palettes = for className, constructor of @constructors
				dd = @dl.children('dd').filter(className)
				dt = dd.prev('dt')
				new constructor dt, dd, this
			
			@dt.event('click')
				.map( ({target}) => Math.floor $(target).index()/2 )
				.subscribe (index) =>
					@state.current index
				
			@state.event('current').subscribe (current) =>
				@dt.toggleClass (index) -> if index == current then 'open' else ''
				
				
	return {
		Palettes: Palettes
	}