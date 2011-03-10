Hash Navigation Made Easy With HashNav!
=======================================
HashNav is an AJAX-esque hash navigation (or "HashNav") class made in JavaScript using MooTools 1.3.

How to Use
----------
If you're in a hurry and just need some decent hash navigation (or a little crash course in observer-oriented hash navigation), you could do something like:

	var hashNav = new HashNav();
	hashNav.registerObserver('observer', { page: true, params: {} }, function(e){ if(e[0]) console.log('event triggered:', e, arguments); }, [1, 2, 3, 4], null, 'header');
	hahsNav.triggerEvent();