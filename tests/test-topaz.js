define(['../library/topaz.js'], function (topaz) {

	module('ObservableSet');
	
	test('add', function () {
	
		var set = new topaz.ObservableSet(),
			added;
			
		set.event('add').subscribe(function (item) { added = item; });
		set.add('red');
		
		equals(added,'red','Event argument is added item');	
		deepEqual(set.get(), ['red'], 'Item is added to set');
				
	});
	
	test('remove', function () {
	
		var set = new topaz.ObservableSet([1,2,3,4,5,6]),
			removed = [];
			
		set.event('remove').subscribe(function (item) { removed.push(item); });
		set.remove(function (item) { return item % 2 == 0; });
		
		deepEqual(removed,[2,4,6],'Event argument is removed item');
		deepEqual(set.get(),[1,3,5],'Items are removed from set');
		
		
	});

});