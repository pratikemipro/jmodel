// ============================================================================
//															 Opal jQuery plugin
// ============================================================================

define(['jquery','jmodel/opal'], function (jQuery,opal) {

	if ( typeof jQuery != 'undefined' ) {
		jQuery.fn.opal = function () {
			return opal.Set.fromJQuery(this);
		};
		if ( typeof _$ == 'undefined') {
			_$ = opal.pipe(jQuery,opal.Set.fromJQuery);
		}
	}
	
})