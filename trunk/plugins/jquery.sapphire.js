// ============================================================================
//														 Sapphire jQuery plugin
// ============================================================================

define(['jquery','jmodel/sapphire'], function (jQuery,sapphire) {

	if ( typeof jQuery != 'undefined' ) {
		
		jQuery.fn.toSet = function () {
			return sapphire.Set.fromJQuery(this);
		};
		
		jQuery.fn.view = function (constructor) {
			return sapphire.Set.fromArray(this.map(sapphire._1.then(sapphire.construct.apply(null,arguments))).get());
		};
		
		if ( typeof _$ == 'undefined') {
			_$ = sapphire.pipe(jQuery,sapphire.Set.fromJQuery);
		}
		
	}
	
});