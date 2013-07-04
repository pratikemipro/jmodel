# Record

		
		window.Record = class Record
		
			@Of: Function.From(Object) (constructors) -> 
			
				record = class extends this
				
					constructor: (data={}) ->
						@_ = {}
						@[field] data[field] for field in @fields
						
					fields: ( field for own field of constructors )
				
				for own field, constructor of constructors
					do (field,constructor) ->
						record.prototype[field] = Function.switch [
							Function.From(Not Function) \
								Function.Of(constructor).Chaining (value) ->
									@_[field] = value
							Function.From(Function) \
								Function.Chaining (fn) ->
									@[field] fn.call this, @_[field]
							Function.From() \
								-> @_[field]
						]
				
				return record
					
