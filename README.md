Hash Navigation Made Easy With HashNav!
=======================================
HashNav is an AJAX-esque hash navigation (or "HashNav") class made in JavaScript using MooTools 1.3.

Some of the nifty (and quite-frankly awesome) tools provided to developers include:

* Query, grab, and manipulate hash data in the URI
* Quickly and easily navigate through a local history repository
* Register and unregister URI observer events (which can optionally be tied to DOM elements)
* Serialize (take a snapshot of) the current hash session
* Unserialize and fully restore a saved hash session
* Supports the search-engine crawler routine a la "#!/"
* Accounts for native "hashchange" support and adjusts accordingly.
* Only requires a small subset of the MooTools Core library to function properly (at its most conservative).

Do note that this bad boy is **STILL IN BETA** and as such probably contains a few bugs that I have yet to find whilst testing the hell 
out of it these past few days. I'll stomp them as I come across them, but if you happen across any yourself, **don't hesitate to file an 
issue** (or fork the project and stomp a few yourself) and I'll hop right on it.

Feel free to file an issue if you see any errors/typos/broken links in the README file as well. Thanks!

*Check the change log for more information on releases!*  
For demos and example code, check out this git page: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav "It's 
really cool :D")  
Be sure to read the [full documentation](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md "It's really cool :D") to 
understand the *full power* of this class.

How to Use
----------
If you're in a hurry and just need some decent hash navigation (or a little crash course in observer-oriented hash navigation), you could do something like:

	var hashNav = new HashNav();
	hashNav.registerObserver('observer', { page: true, params: {} }, function(e){ if(e[0]) console.log('event triggered:', e, arguments); }, [1, 2, 3, 4], null, 'header');
	hahsNav.triggerEvent();

What this does is register an observer named **observer** with the hashNav object, which handles all the nitty-gritty details of hash 
navigation for you.

This observer will watch the URI hash and call the function

	function(e){ if(e[0]) console.log('event triggered:', e, arguments); }

with arguments `[1, 2, 3, 4]` bound to the default namespace denoted by `null` whenever it observes any [legal]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to it!") page change that satisfies its 
[trigger object](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ObserverTriggers "Jump to it!"). For example:

	#!/home -> #!/about
	#!/faq&&entry=1 -> #!/faq&&entry=2

(Check out [How Hashes Are Parsed](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to 
it!") for more information on what's going in *within* the example function itself.)

Now, the final line, `hashNav.triggerEvent();`, is called so that our new observer is alerted to any potential change.  
For more information on how to use the glorious trigger system in conjunction with the magical observer paradigm, read the 
[documentation](http://xunnamius.github.com/HashNav "It's really cool :D").