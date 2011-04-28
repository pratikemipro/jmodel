// ============================================================================
//														 Sapphire jQuery plugin
// ============================================================================

define(['jquery','jmodel/sapphire'], function (jQuery,sapphire) {

	if ( typeof jQuery != 'undefined' ) {
		jQuery.fn.set = function () {
			return sapphire.Set.fromJQuery(this);
		};
		if ( typeof _$ == 'undefined') {
			_$ = sapphire.pipe(jQuery,sapphire.Set.fromJQuery);
		}
	}
	
})