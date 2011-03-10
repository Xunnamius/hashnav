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

##Properties
* Singleton
* Modular

##Syntax
	var hashNav = new HashNav([options]);

##Arguments
1. Options (`object`, optional) See below.

##Options
* interval - (`integer`: defaults to **200**) This value determines how long the pause (in milliseconds) between function calls for the 
polling method will be. Ignored when the native `onhashchange` event is present.

* prefix - (`string`: defaults to **"!/"**) Determines the string that will be looked for after the pound/hash sign (#) in URIs. If the 
prefix is **not** found, the HashNav object will refuse to recognize the hash change as [legal]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to it!") and will ignore it, as will 
*most* observers (see [observer triggers](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ObserverTriggers "Jump 
to it!") below).

* defaultHome - (`string`: defaults to **"home"**) Your website's "meta-homepage." When visitors navigate to your page using a [Relative 
Hash](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#RelativeHashes "Jump to it!"), the HashNav object will 
assume the user navigated to the `defaultHome` page. Check out [Relative Hashes]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#RelativeHashes "Jump to it!") for more information on this 
integral setting.

* trackHistory - (`boolean`: defaults to **true**) Enables [history tracking]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HistoryTracking "Jump to it!") and exposes HashNav's native 
[history.*](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMI-history "Jump to it!") methods if set to `true`. 
Do not touch this unless you're perfectly sure you recognize the [various compounding implications]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#vci "Jump to it!").

* exposeObserverMethods - (`boolean`: defaults to **true**) Exposes the [observe()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#DMI-observe "Jump to it!") and [observe()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#DMI-unobserve "Jump to it!") methods to MooTools's [Element]
(http://mootools.net/docs/core/Element/Element "MooTools Core Documentation: Element") type (via [implementation]
(http://mootools.net/docs/core/Class/Class#Class:implement "MooTools Core Documentation: Implement")) if set to `true`, allowing 
[observe()](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#DMI-observe "Jump to it!") to be called from any DOM 
element as opposed to tying the observer to an element (a somewhat arduous journey) using [registerObserver()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMI-registerObserver "Jump to it!").

* cleanQueryString - (`boolean`: defaults to **false**) A **very** dangerous setting that will strip any nonconforming parameter entries 
and anything else MooTools's [String.cleanQueryString()](http://mootools.net/docs/more/Types/String.QueryString#String:cleanQueryString 
"MooTools More Documentation: cleanQueryString") method doesn't like if set to `true`. If set to `false`, a version of the 
[String.parseQueryString()]( http://mootools.net/docs/more/Types/String.QueryString#String:parseQueryString "MooTools More 
Documentation: String:parseQueryString") method is used instead (this is default). It is recommended you leave this off (`false`) unless 
you [know what you're doing](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to it!").

* queryMakeFalse - (`boolean`: defaults to **false**) When query strings are transcoded to key/value pairs, a blank parameter (`param=`) 
will become a blank string (`param:""`) by default (`false`). When `queryMakeFalse` is set to `true`, however, a blank parameter will be 
become a literal false (`param:false`). See [How Hashes Are Parsed]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#HowHashesAreParsed "Jump to it!") for more information.

* externalConstants - (`array`) Determines the key the [observe()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#DMI-observe "Jump to ‘DOM Level Methods') DOM element method will 
use to store its pertinent data ("NAVOBJOBSDATA") along with the cookie prefix used when the [serialize()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMI-serialize "Jump to it!") method is called ("NAVOBJSERDATA").

* cookieOptions - (`object`) An object containing key/value pairs representing the default options passed to MooTools's [Cookie]
(http://mootools.net/docs/core/Utilities/Cookie "MooTools Core Documentation: Cookie") object.

* ignoreVersionCheck - (`boolean`: defaults to **false**) When attempting to restore a session using [unserialize()]
(http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#PMI-unserialize "Jump to it!"), version checking is used to 
prevent session data generated by older versions of the HashNav object from being recreated due to potential inconsistencies [future 
updates](http://github.com/Xunnamius/HashNav/blob/master/Docs/Documentation.md#ComingSoon "Jump to it") may introduce into the 
serialization process. This version check can be skipped (at your own peril) by setting this option to `true`, which is definitely 
**not** recommended.

For more information on how to use the HashNav class, read the [documentation](http://xunnamius.github.com/HashNav).  
For demos and example code, check out this git page: [http://xunnamius.github.com/HashNav](http://xunnamius.github.com/HashNav)  
*Check the change log for more information on releases!*