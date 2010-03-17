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
        relationshipIndex;
    
    for ( index in relationships ) {
        if ( relationships[index].accessor === accessor ) {
            relationshipIndex = index;
            break;
        }
    }
    
    if ( relationshipIndex ) {
        var specification = relationships[relationshipIndex];
        relationships.splice(relationshipIndex,1);
        return {
            entitytype: this,
            context: this.context,
            specification: specification,
            to: function (entityTypeName,relationshipName) {
                if ( relationshipName ) {
                    specification.accessor = relationshipName;
                }
                this.context.entity(entityTypeName).constructor.prototype.hasMany.push(specification);
                return this.entitytype;
            }
        }
    }
    
    return false;
     
}