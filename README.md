Hash Navigation Made Easy With HashNav!
=======================================
HashNav is a powerful AJAX-esque hash navigation (or "HashNav") class made in JavaScript using MooTools 1.3.

![Screenshot](http://i.imgur.com/sWNmn.png)

Some of the nifty tools provided for developers include:

* One of the most unique and intuitive hash URI parsers around
* Query, grab, and manipulate hash data in the URI in a succinct and efficient manner
* Quickly and easily navigate through a local history "smart-repository"
* Register and unregister powerful URI observer events (which can be easily tied to DOM elements), capable of meeting all your needs
* Serialize (take a snapshot of) the current hash session for later analysis, storage, or session sharing
* Unserialize and fully restore a saved hash session as if the user never left!
* Supports custom hash prefixes other than the traditional hash (#).
* Supports the search-engine AJAX crawler routine a la "#!/"
* Accounts for native "hashchange" support and adjusts accordingly.
* Only requires a small subset of the MooTools Core library to function properly (at its most conservative).
* Very small core file (6.05KB uncompressed, 2.02KB gzipped). 60% smaller than beta version.
* New modularized class structure reduces HashNav's overall footprint by over 50% when compared to the beta version.
* Tested against MooTools 1.3.x

Be sure to read the [full documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md "It's really cool :D") to understand the *full power* of this class.  
For a fun little HashNav sandbox to frolic around in, check out this GitHub page: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav "It's really cool :D")

How to Use
----------
If you're in a hurry and just need some decent hash navigation (or a little crash course in observer-oriented hash navigation), you could do something like:

	var hashNav = new HashNav(),
	observerName = 'helloworld',
	trigger = { page: true, params: {} },
	callback = function(e){ console.log('event triggered:', e, arguments); },
	arguments = [1, 2, 3, 4],
	bind = null,
	elementToScrollTo = 'scrollto';
	
	hashNav.registerObserver(observerName, trigger, callback, arguments, bind, elementToScrollTo);
	hashNav.triggerEvent();

What this does is register an observer named **helloworld** with the hashNav object, which handles all the nitty-gritty details of hash navigation for you.

This observer will watch the URI hash and call the callback function

	function(e){ console.log('event triggered:', e, arguments); }

with arguments `[1, 2, 3, 4]` bound to the default namespace (denoted by `null`) whenever it observes any [legal](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to it!") hash URI page/state designator change that satisfies its [trigger object](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ObserverTriggers "Jump to it!"). For example:

	#!/home -- changing to --> #!/about
	#!/faq&&entry=1 -- changing to --> #!/faq&&entry=2

Now, the final line, `hashNav.triggerEvent();`, is equivalent to the gun shot at the horse races. It's the signal to go!

Advanced Examples
-------------
Loading data whenever the application's page/state designator changes:

	hashNav.registerObserver(
		'main',
		
		{
			page: true,
			params: {}
		},
	
		function(){ load.ajax.data(); }
	);

Load different home pages based on a custom "type" parameter:

	hashNav.registerObserver(
		'home_loader',
		
		{
			page: true,
			params: { type:'' } // The empty string in the trigger object's params sub-object means "if the parameter is present with any value". Check out the documentation!
		},
	
		function(e){ load.a.custom.page(e[1].pathParsed['type']); }
	);

Spawn a popunder box to warn a user not to leave the page or the data they typed will be lost. We'll be looking for the "composing" param to be present and orphaned, we're on the "emailer" page, and we'll pass their username in a "username" param. To top it all off, we want to see these parameters exclusively, meaning we only want to see what we listed in the params object and nothing else:
	
	hashNav.registerObserver(
		'warning',
		
		{
			page: 'emailer',
			params: { composing: true, username:'' },
			qualifiers: { exclusive: true }
		},
	
		function(e){ warningPopup('Watch out ' + this.get('username') + ', if you leave the ' + this.getCurrent() + ' page before saving, everything you just typed will be lost!'); }
	);

We want to store random data in both the key and value of a variable amount of parameters on the [defaultHome](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#options) page only:

	hashNav.registerObserver(
		'test',
		
		{
			page: '',
			params: { '*':'' }
		},
	
		function(e){ store.this.data('Full Hash: ' + e[0]); }
	);
	
Or we could do what we just did above, except add a limit to the amount of parameters:

	hashNav.registerObserver(
			'test',
			
			{
				page: '',
				params: { '*':'' },
				qualifiers: { minparams: 3, maxparams: 10 }
			},
		
			function(e){ store.this.data('Full Hash: ' + e[0]); }
	);

For some reason we want all the parameter values to be the same:

	hashNav.registerObserver(
		'helloworld',
		
		{
			page: 'somerandompage',
			params: { '*':'All params must equal this text!' }
		},
	
		function(e){ store.this.data('Full Hash: ' + e[0]); }
	);

For more information on how to use the observer/trigger system, read the [documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ObserverTriggers). You may also be interested in a live demo of the *whole* class, available here: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav).

Syntax
------
	var hashNav = new HashNav([options]);

Arguments
---------
1. Options (`object`, optional) See [documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#options).

*Check the change log for more information on releases!*