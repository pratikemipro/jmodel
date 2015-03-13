	define 'jview/tiles', (require) ->
	
		$ = require 'jquery'
		require 'jmodel/topaz2'
	
		class Tile
		
			constructor: (@li) ->
			
				@events = new EventRegistry 'ready', 'dispose'
			
				@li.event 'click','.close'
					.subscribe =>
						@event 'dispose'
							.raise this
						false
			
			event: (name) -> @events.get name
			
	
		class TileList extends (Observable List.Of Tile)
		
			constructor: (args...) ->
			
				super
			
				@events.add 'ready'
				@events.add 'new', EventType.disjoin \
					@event 'add'
					@event 'insert'
			
				@event 'new'
					.subscribe (tile) =>
						tile.event 'ready'
							.subscribe (tile) =>
								@event 'ready'
									.raise tile
								
				@event 'dispose'
					.subscribe (tile) =>
						@remove tile
							
		return {
			Tile: Tile
			TileList: TileList
		}
		
