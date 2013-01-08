/*
 *	jQuery Domain Plugin v0.1.0
 *	http://code.google.com/p/jmodel/
 *
 *	Copyright (c) 2010-2013 Richard Baker
 *	Dual licensed under the MIT and GPL licenses
 *
 *  Requires jModel
 *
 */

// =========================================================================
// 												Domain binding jQuery plugin
// =========================================================================

// NOTE: Make it possible to publish to a method not just a key?
// NOTE: Make publishing work for domain member subscriptions
jQuery.fn.publish = function (publication) {

	function Publisher (source,target,key,failure,success) {

		target.event(key).subscribe({
			
			message: success || function _success () {
				source
					.attr('title','')
					.animate({
						backgroundColor: 'white'
					},500);
			},
			
			error: failure || function _failure (message) {
				source
					.attr('title',message)
					.animate({
						backgroundColor: 'red'
					},250)
					.animate({
						backgroundColor: '#ff7777'
					},500);
			}
			
		});

		var publish = function _publish (event) {
			target.set(key,jQuery(event.target).val());
		};

		return publish;

	}

	if ( publication.selector && publication.member.bindings ) {

		this.each(function (index,element) {
			for (var selector in publication.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					var publisher = new Publisher();
					publication.target.subscribe({
						source: publication.target,
						predicate: publication.predicate,
						selector: publication.selector,
						initialise: publication.initialise,
						description: publication.description || 'domain collection publication',			
						member: {
							target: jQuery(object),
							key: publication.member.bindings[selector],
							change: function (key,object) {
								return function (target) {
									jQuery(object).bind('blur',  Publisher(jQuery(object),target,key));
									jQuery(object).bind('change',Publisher(jQuery(object),target,key));
								};
							}(publication.member.bindings[selector],object),
							initialise: publication.initialise,
							description: publication.description || 'domain collection member subscription'
						}
					});
				});
			}
		});

		return this;

	}
	else if ( publication.selector ) {

		var that=this;

		publication.target.subscribe({
			source: publication.target,
			predicate: publication.predicate,
			selector: publication.selector,
			initialise: publication.initialise,
			description: publication.description || 'domain collection publication',			
			member: {
				target: that,
				key: publication.key,
				change: function (target) {
					that.bind('blur',  Publisher(that,target,publication.member.key));
					that.bind('change',Publisher(that,target,publication.member.key));	
				},
				initialise: publication.initialise,
				description: publication.description || 'domain collection member subscription'
			}
		});

		return this;

	}
	else if ( publication.bindings ) {

		for (var selector in publication.bindings) {
			jQuery(selector,this).each(function (index,object) {
				jQuery(object).bind('blur',  Publisher(jQuery(object),publication.target,publication.bindings[selector]));
				jQuery(object).bind('change',Publisher(jQuery(object),publication.target,publication.bindings[selector]));
			});
		}
		return this;

	}
	else {

		if ( this.blur ) {
			this.blur(function (event) {
				Publisher(jQuery(this),publication.target,publication.key)(event);
			});
		}
		if ( this.change ) {
			this.change(function (event) {
				Publisher(jQuery(this),publication.target,publication.key)(event);
			});
		}
		return this;

	}

};

jQuery.fn.subscribe = function (subscription) {

	if ( subscription.key && !subscription.selector ) { // Basic subscription

		return this.each(function (index,element) {
			subscription.key = subscription.key instanceof Array ? subscription.key : [subscription.key];
			jQuery.each(subscription.key,function (index,key) {
				subscription.source.subscribe(opal.copy(subscription).defaults({
					description: 'application subscription'
				}).addProperties({
					application: true,
					target: jQuery(element),
					key: key
				}));
			});
		});

	}
	else if ( !subscription.member && subscription.bindings ) { // Multiple subscription through selector/key mapping

		return this.each(function (index,element) {
			for (var selector in subscription.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe(opal.copy(subscription).defaults({
						description: 'application subscription'
					}).addProperties({
						application: true,
						target: jQuery(object),
						key: subscription.bindings[selector]
					}));
				});
			}
		});

	}
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member && subscription.member.bindings ) { // Subscription to members of collection with bindings

		return this.each(function (index,element) {
			for (var selector in subscription.member.bindings) {
				jQuery(selector,element).each(function (index,object) {
					subscription.source.subscribe(opal.copy(subscription).defaults({
						description: 'application subscription'
					}).addProperties({
						application: true,
						member: opal.copy(subscription.member).defaults({
							description: 'application subscription'
						}).addProperties({
							application: true,
							target: jQuery(object),
							key: subscription.member.bindings[selector]
						})
					}));
				});
			}
		});

	} 
	else if ( ( subscription.predicate || subscription.selector ) && subscription.member ) { // Subscription to members of collection

		return this.each(function (index,element) {
			subscription.source.subscribe(opal.copy(subscription).defaults({
				description: 'application subscription'
			}).addProperties({
				application: true,
				member: opal.copy(subscription.member).defaults({
					description: 'application subscription'
				}).addProperties({
					application: true,
					target: jQuery(element)
				})
			}));
		});

	}
	else { // Subscription to collection

		return this.each(function (index,element) {
			subscription.source.subscribe(opal.copy(subscription).defaults({
				description: 'application subscription'
			}).addProperties({
				application: true,
				target: jQuery(element)
			}));
		});

	}

};

jQuery.fn.pubsub = function (pubsub) {
	return this
			.subscribe(opal.copy(pubsub).addProperties({source:pubsub.object}).removeProperties('object'))
			.publish(opal.copy(pubsub).addProperties({target:pubsub.object}).removeProperties('object'));
};

jQuery.fn.views = function (views) {
	for (var selector in views) {
		jQuery(selector,this).view(views[selector]);
	}
	return this;
};

jQuery.fn.domainSelect = function (binding) {

	binding.value = (typeof binding.value == 'string') ? jModel.method(binding.value) : binding.value;
	binding.label = (typeof binding.label == 'string') ? jModel.method(binding.label) : binding.label;

	return this.each(function (index,element) {

		function addOption (collection,option) {
			jQuery(element).append(	$('<option/>').attr('value',binding.value(option)).text(binding.label(option)) );
		}

		function removeOption (collection, option) {
			$('option[value="'+binding.value(option)+'"]').remove();
		}

		jQuery(element).subscribe({
			source: 		binding.source,
			initialise: 	true,
			description: 	'Domain select',
			initialise: 	addOption,
			add: 			addOption,
			remove: 		removeOption
		});

	});

};