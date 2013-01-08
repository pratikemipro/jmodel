/*
 *	jQuery Permutation Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2013 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 */

jQuery.fn.permute = function (permutation) {

	if ( this.length != permutation.length ) {
		return false;
	}

	var copies = [], placeholders = [], i;
	for (i=0; i<this.length; i++) {
		copies[i] 		= this.get(i);
		placeholders[i] = document.createComment('');
		copies[i].parentNode.replaceChild(placeholders[i],copies[i]);
	}

	for (i=0; i<copies.length; i++) {
		placeholders[i].parentNode.replaceChild(copies[permutation[i]],placeholders[i]);
	}

	return this;

};