/*
 *	jModel OData Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *  Requires jQuery
 *
 */


jModel.plugin.context.fromService = function (url) {
	
	var $ = jQuery;
	
	$.get(url+'/$metadata',function (csdl) {
		
		$('EntityType',csdl).each(function (index,entitytype) {
			
			var entityTypeName = $(entitytype).attr('Name'),
				has			   = parseFields(entitytype),
				hasOne		   = parseRelationships(entitytype,csdl,'Dependent'),
				hasMany		   = parseRelationships(entitytype,csdl,'Principal');
			
		});
		
	},'xml');
	
	function parseFields (entitytype) {
		return $('Property',entitytype).map(function (index,property) {
			return {
				accessor: $(property).attr('Name'),
				defaultValue: $(property).attr('Type') == 'Edm.String' ? '' : 0
			};
		}).get();
	}
	
	function parseRelationships (entitytype,csdl,type) {
		return $('NavigationProperty',entitytype).filter(function (index,relationship) {
			return $('Association[Name="'+$(relationship).attr('Relationship').split('.').pop()+'"] '
					 +type+'[Role="'+$(entitytype).attr('Name')+'"]',csdl).length > 0;
		}).map(function (index,relationship) {
			return {
				accessor: $(relationship).attr('Name')
			};
		}).get();
	}

};