Hash Navigation Made Easy With HashNav!
=======================================
HashNav is a powerful AJAX-esque hash navigation (or "HashNav") class made in JavaScript. It is compatible with MooTools versions 1.3 and up.

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
* Supports custom URI parsers that allow for URIs #!/that/look/like/this or #!/that&&look=like&this
* Developers can write their own URI parsers quickly and easily to style hash URIs in any imaginable way.
* Accounts for native "hashchange" support and adjusts accordingly.
* Only requires a small subset of the MooTools Core library to function properly (at its most conservative).
* Very small core file (~6.05KB uncompressed, ~2.02KB gzipped @ v1.2). 60% smaller than beta version.
* New modularized class structure reduces HashNav's overall footprint by over 50% when compared to the beta version.
* Tested against MooTools 1.3.x and 1.4.0-5

Be sure to read the [full documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md "It's really cool :D") to understand the *full power* of this class.  
For a fun little HashNav sandbox to frolic around in, check out this GitHub page: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav "It's really cool :D")

What's New in 1.3
-------------
* Minor optimizations
* Updated README and documentation
* Modularized the URI parser methods, allowing for others to easily create custom URI parser classes for HashNav
* Added a URI parser that allows for URIs to be structured in a similar fashion to Zend Framework URIs (using slashes instead of ampersands)

Setting up Your Page
-------------
To use HashNav in its most conservative state, the HTML would look similar to the following:

	<script type="text/javascript" src="mootools/mootools-core-1.4.5.js"></script>
	<script type="text/javascript" src="mootools/mootools-more-1.4.0.1.js"></script>
	<script type="text/javascript" src="HashNav/String.QueryStringImproved.js"></script>
	<script type="text/javascript" src="HashNav/Object.compare.js"></script>
	<script type="text/javascript" src="HashNav/HashNav.js"></script>
	<script type="text/javascript" src="myMainExternalScript.js"></script>

While a more holistic application of the HashNav library would require more or all of the modules to be imported (**after HashNav.js is included in your document**). That would look a little something like this:
	
	<script type="text/javascript" src="mootools/mootools-core-1.4.5.js"></script>
	<script type="text/javascript" src="mootools/mootools-more-1.4.0.1.js"></script>
	
	<script type="text/javascript" src="HashNav/String.QueryStringImproved.js"></script>
	<script type="text/javascript" src="HashNav/Object.compare.js"></script>
	
	<script type="text/javascript" src="HashNav/HashNav.js"></script>
	
	<script type="text/javascript" src="HashNav/more/parsers/parser.slash.js"></script>
	
	<script src="HashNav/HashNav.DOM.js" type="text/javascript"></script>
	<script src="HashNav/HashNav.Fx.js" type="text/javascript"></script>
	<script src="HashNav/HashNav.History.js" type="text/javascript"></script>
	
	<script src="HashNav/more/HashNav.serialize.js" type="text/javascript"></script>
	<script src="HashNav/more/HashNav.deserialize.js" type="text/javascript"></script>
	<script src="HashNav/more/HashNav.unserialize.js" type="text/javascript"></script>
	<script src="HashNav/more/HashNav.unregisterObservers.js" type="text/javascript" ></script>
	<script src="HashNav/more/HashNav_T-QualifierLogic.js" type="text/javascript"></script>
	<script src="HashNav/more/HashNav_T-WildcardLogic.js" type="text/javascript"></script>
	
	<script type="text/javascript" src="myMainExternalScript.js"></script>

Note the general order. Scripts that come before the HashNav core (HashNav.js) should always come before, while scripts that come after should almost always come after.

Of course, to save http requests, one could consolidate the various module files he or she wishes to use into one javascript file.

How to Use
----------

[Click here](https://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMIX "Browse to it!") to jump to HashNav's method index.

If you're in a hurry and just need some decent hash navigation (or a little crash course in observer-oriented hash navigation), you could do something (verbose) like:

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
Note that you can copy and paste all of the following examples into your browser's JS console in [HashNav's sandbox](http://xunnamius.github.com/HashNav). Don't forget to load the appropriate modules.

Loading data whenever the application's page/state designator changes:

	hashNav.registerObserver(
	
		'main',
		
		{
			page: true,
			params: {}
		},
	
		function(){ load.ajax.data(); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/home2`
<br />
<br />
<br />
Load different home pages based on a custom "type" parameter:

	hashNav.registerObserver(
	
		'home_loader',
		
		{
			page: true,
			
			/* The empty string in the params object roughly translates to "if the
			   parameter is present with any value". Check out the documentation! */
			params: { type:'' }
		},
	
		function(){ load.a.custom.page(this.get('type')); }
	
		// You can use the event object that is passed to the function to achieve the same effect
		// function(e){ load.a.custom.page(e[1].pathParsed['type']); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/home3&&type=5`
<br />
<br />
<br />
Spawn a popunder box to warn a user not to leave the page or the data they typed will be lost. We'll be looking for the "composing" param to be present and orphaned, we're on the "emailer" page, and we'll pass their username in a "username" param. To top it all off, we want to see these parameters exclusively, meaning we only want to see what we listed in the params object and nothing else:
	
	hashNav.registerObserver(
	
		'warning',
		
		{
			page: 'emailer',
			params: { composing: true, username:'' },
			qualifiers: { exclusive: true }
		},
	
		function(){ warningPopup('Watch out '+
					 this.get('username')+
					 ', if you leave the '+
					 this.getCurrent()+
					 ' page before saving, everything you just typed will be lost!');
			  }
		
		// You can use the event object that is passed to the function to achieve a *similar* effect
		/* function(e){ warningPopup('Watch out '+
					     e[1].pathParsed['username']+
					     ', if you leave the ' + e[0] +
					     ' page before saving, everything you just typed will be lost!');
			      }*/
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/emailer&&composing&username=Xunnamius`
<br />
<br />
<br />
We want to store random data in both the key and value of a variable amount of parameters on the [defaultHome](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#options) page only:

	hashNav.registerObserver(
	
		'test',
		
		{
			page: '',
			params: { '*':'' }
		},
	
		function(e){ store.that.data('Full Hash (test): ' + this.getStoredHashData()[0]); }
		
		// You can use the event object that is passed to the function to achieve the same effect
		// function(e){ store.that.data('Full Hash: ' + e[0]); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/&&var1=5&var2=6&var3=3rav&var4&var5=`
<br />
<br />
<br />
Or we could do what we just did above, except add a limit to the amount of parameters:

	hashNav.registerObserver(
	
		'test',
		
		{
			page: '',
			params: { '*':'' },
			qualifiers: { minparams: 3, maxparams: 10 }
		},
	
		function(e){ store.that.data('Full Hash (test-limit): ' + e[0]); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/&&var1=5&var2=6&var3=3rav&var4&var5=`
<br />
<br />
<br />
For some reason we want all the parameter values to be the same:

	hashNav.registerObserver(
	
		'helloworld',
		
		{
			page: 'somerandompage',
			params: { '*':'All params must equal this text!' }
		},
	
		function(e){ store.that.data('Full Hash (helloworld): ' + this.getStoredHashData()[0]); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/somerandompage&&var1=All params must equal this text!&var2=All params must equal this text!`
<br />
<br />
<br />
How about a general trigger that observes **every** page change (even illegal ones) and doesn't use a params object at all (perhaps you want to filter params yourself using [get()](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMI-get)):

	hashNav.registerObserver(
	
		'foobartester',
		
		{ page: false },
	
		function(e){ console.log('Catch all:', e); }
	);

[Satisfying hash URI](http://xunnamius.github.com/HashNav "Test this method"): `#!/foobartester&&catch=all`
<br />
<br />
<br />
For more information on how to use the observer/trigger system, read the [documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ObserverTriggers). Again, you may also be interested in a live demo of the *whole* class, available here: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav). [Click here](https://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMIX "Browse to it!") if you would like to view HashNav's method index.

Syntax
------
`var hashNav = new HashNav([options]);`

Arguments
---------
1. Options (`object`, optional) See [documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#options).

*Check the change log for more information on releases!*