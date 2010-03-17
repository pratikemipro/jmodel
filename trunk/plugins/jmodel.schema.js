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
 
jModel.plugin.entitytype.pushOneToManyRelationship = function (accessor) {

    var relationships = this.constructor.prototype.hasMany,
        context = this.context;
    
    var foundIndex = relationshipIndex(accessor,relationships)
    if ( foundIndex ) {
        return {
            entitytype: this,
            context: this.context,
            specification: relationships[foundIndex],
            to: function (entityTypeName,relationshipName) {
                var targetEntity = this.context.entity(entityTypeName);
                removeRelationship(this.specification.accessor,targetEntity.options.parent);
                if ( relationshipName ) {
                    this.specification.accessor = relationshipName;
                }
                targetEntity.constructor.prototype.hasMany.push(this.specification);
                return this.entitytype;
            }
        }
    } else {
        return false;
    }
    
    function relationshipIndex (accessor,relationships) {
        for ( index in relationships ) {
            if ( relationships[index].accessor === accessor ) {
                foundIndex = index;
                break;
            }
        }
        return foundIndex;
    }
    
    function removeRelationship (accessor,entityName) {
        while ( entityName ) {
            var entity = context.entity(entityName),
                relationships = entity.constructor.prototype.hasMany;
            relationships.splice(relationshipIndex(accessor,relationships),1);
            entityName = entity.options.parent;
        }
        
    }
     
}