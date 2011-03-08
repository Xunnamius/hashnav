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

Do note that this bad boy is **STILL IN BETA** and as such probably contains *a myriad of bugs and glitches that I have yet to find* whilst using it. I'll stomp them as I come across them, but if you happen across any yourself, **don't hesitate to file an issue** (or fork the project and stomp a few yourself) and I'll hop right on it.

<br />
Crash Course
------------

If you're in a hurry and just need some decent hash navigation, you could do something like this:

	var hashNav = new HashNav();
	hashNav.registerObserver('observer', { page: true, params: {} }, function(e){ if(e[0]) console.log('event triggered:', e, arguments); }, [1, 2, 3, 4], null, 'header');
	hahsNav.triggerEvent();

What this does is register an observer named **observer** with the hashNav object, which handles all the nitty gritty details of hash navigation for you.

This observer will watch the URI hash and call the function

	function(e){ if(e[0]) console.log('event triggered:', e, arguments); }

with arguments `[1, 2, 3, 4]` bound to the default namespace denoted by `null` whenever it observes any [legal](#HowHashesAreParsed "Jump to it!") page change. For example:

	#!/home -> #!/about
	#!/faq&&entry=1 -> #!/faq&&entry=2

(Check out [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!") for more information on what's going in *within* the example function itself.)

Now, the final line, `hashNav.triggerEvent();`, is called so that our new observer is alerted to any potential change.

<br />
Class: HashNav
==============

##Implements
* [Options]( http://mootools.net/docs/core/Class/Class.Extras#Options/ "MooTools Core Documentation: Options")
* [Events]( http://mootools.net/docs/core/Class/Class.Extras#Events/ "MooTools Core Documentation: Events")

##Properties
* Singleton
* Modular

##Requires
* [Conservative](#UsageModes "Jump to it!")
	* **Core**: `Core`, **All** `Types`, `Browser`, **All** `Class`, **All** `Slick` (dependency of `Element` & `DOMReady`), `Element` & `Element.Event`, `DOMReady`
	* **More**: `More`, `String.QueryString`
* \+ [Window Scrolling](#UsageModes "Jump to it!")
	* **Core**: `Fx`
	* **More**: `Fx.Scroll`
* \+ [Serialization](#UsageModes "Jump to it!")
	* **Core**: `Cookie`, `JSON`
	* **More**: (none)

##Syntax
	var hashNav = new HashNav([options]);

##Arguments
1. Options (`object`, optional) See below.

##Options
* interval - (`integer`: defaults to **200**) This value determines how long the pause (in miliseconds) between function calls for the polling method will be. Ignored when the native `onhashchange` event is present.

* prefix - (`string`: defaults to **"!/"**) Determines the string that will be looked for after the pound/hash sign (#) in URIs. If the prefix is **not** found, the HashNav object will refuse to recognize the hash change as [legal](#HowHashesAreParsed "Jump to it!") and will ignore it, as will *most* observers (see [observer triggers](#ObserverTriggers "Jump to it!") below).

* defaultHome - (`string`: defaults to **"home"**) Your website's "meta-homepage." When visitors navigate to your page using a [Relative Hash](#RelativeHashes "Jump to it!"), the HashNav object will assume the user navigated to the `defaultHome` page. Check out [Relative Hashes](#RelativeHashes "Jump to it!") for more information on this integral setting.

* trackHistory - (`boolean`: defaults to **true**) Enables [history tracking](#HistoryTracking "Jump to it!") and exposes HashNav's native [history.*](#PMI:history "Jump to it!") methods if set to `true`. Do not touch this unless you're perfectly sure you recognize the [various compounding implications](#vci "Jump to it!").

* exposeObserverMethods - (`boolean`: defaults to **true**) Exposes the [observe()](#DMI:observe "Jump to it!") and [observe()](#DMI:unobserve "Jump to it!") methods to MooTools's [Element](http://mootools.net/docs/core/Element/Element "MooTools Core Documentation: Element") type (via [implementation](http://mootools.net/docs/core/Class/Class#Class:implement "MooTools Core Documentation: Implement")) if set to `true`, allowing [observe()](#DMI:observe "Jump to it!") to be called from any DOM element as opposed to tying the observer to an element (a somewhat arduous journey) using [registerObserver()](#PMI:registerObserver "Jump to it!").

* cleanQueryString - (`boolean`: defaults to **false**) A **very** dangerous setting that will strip any nonconforming parameter entries and anything else MooTools's [String.cleanQueryString()](http://mootools.net/docs/more/Types/String.QueryString#String:cleanQueryString "MooTools More Documentation: cleanQueryString") method doesn't like if set to `true`. If set to `false`, a version of the [String.parseQueryString()]( http://mootools.net/docs/more/Types/String.QueryString#String:parseQueryString "MooTools More Documentation: String:parseQueryString") method is used instead (this is default). It is recommended you leave this off (`false`) unless you [know what you're doing](#HowHashesAreParsed "Jump to it!").

* queryMakeFalse - (`boolean`: defaults to **false**) When query strings are transcoded to key/value pairs, a blank parameter (`param=`) will become a blank string (`param:""`) by default (`false`). When `queryMakeFalse` is set to `true`, however, a blank parameter will be become a literal false (`param:false`). See [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!") for more information.

* externalConstants - (`array`) Determines the key the [observe()](#DMI:observe "Jump to ‘DOM Level Methods') DOM element method will use to store its pertinent data ("NAVOBJOBSDATA") along with the cookie prefix used when the [serialize()](#PMI:serialize "Jump to it!") method is called ("NAVOBJSERDATA").

* cookieOptions - (`object`) An object containing key/value pairs representing the default options passed to MooTool's [Cookie]( http://mootools.net/docs/core/Utilities/Cookie "MooTools Core Documentation: Cookie") object.

* ignoreVersionCheck - (`boolean`: defaults to **false**) When attempting to restore a session using [unserialize()](#PMI:unserialize "Jump to it!"), version checking is used to prevent session data generated by older versions of the HashNav object from being recreated due to potential inconsistencies [future updates](#ComingSoon "Jump to it") may introduce into the serialization process. This version check can be skipped (at your own peril) by setting this option to `true`, which is definitely **not** recommended.

##Events
###navchange
Fired on the `window` object when the HashNav object recognizes a hash change.
####Signature
	onNavchange(storedHashData)
####Arguments
1. storedHashData - (`object`) The hash data-object representing the most recent URI hash change.

##Public Method Index

##DOM Method Index

###Element Method: <a name="DMI:observe"></a>observe
Calls [registerObserver()](#PMI:registerObserver "Jump to it!") on a DOM element, allowing said element to observe the hash URI and trigger a function if specific conditions are met. Note that this method passes [registerObserver()](#PMI:registerObserver "Jump to it!") the current object's ID/Class/Name/TagName as the `name` argument.

####Syntax
	myElement.observe(trigger, fn[, args[, scrollToElement]]);

####Arguments
1. trigger - (`object`) Trigger object. See [observer trigger](#ot "Jump to it!").
2. fn - (`function`) Function to call (the function is bound to the current DOM object)
3. args - (`mixed`, optional) Arguments to pass the above function. Can be a single argument or an array of arguments.
4. scrollToElement - (`mixed`, optional) An ID string/element DOM object that will be scroll to using `Fx.Scroll.toElement()`. If `scrollToElement` is `true`, the observing DOM element will be scrolled to.

####Returns
* (`element`) The DOM element in question.

####Examples
	// Create a new Element and insert it into the document
	var myElement = new Element('div', { id: 'myFirstElement' });
	myElement.inject(document.body);
	
	// Tell the element to observe the hash URI for our specific changes
	$('myFirstElement').observe({ page: 'home2', params: {object:1, object2:true, magic:'happening', object3:'~'} }, function(e){ alert('Hello World!'); console.log(arguments); }, [1,2,3], true);
	
	// Will trigger when hash URI = #!/home2&&object=1&object2=true&magic=happening

###Element Method: <a name="DMI:unobserve"></a>unobserve
Calls [unregisterObserver()](#PMI:unregisterObserver "Jump to it!") on an observing DOM element. Note that this method passes [unregisterObserver()](#PMI:unregisterObserver "Jump to it!") the current object's ID/Class/Name/TagName as the `name` argument.

####Syntax
	myElement.unobserve();

####Returns
* (`element`) The DOM element in question.

####Examples
	// Create a new Element and insert it into the document
	var myElement = new Element('div', { id: 'myFirstElement' });
	myElement.inject(document.body);
	
	// Tell the element to observe the hash URI
	$('myFirstElement').observe( ... );
	
	// Will trigger when hash URI = #!/home2&&object=1&object2=true&magic=happening
	
	// And finally, remove the observer, which will stop the element from observing hash URI changes!
	$('myFirstElement').unobserve(); // Easy right?

###Element Method: <a name="DMI:observing"></a>observing
Returns the DOM element's observer status.

####Syntax
	myElement.observing();

####Returns
* (`boolean`) `true` if the element is currently observing the hash URI or `false` if it is not.

####Examples
	// Create a new Element and insert it into the document
	var myElement = new Element('div', { id: 'myFirstElement' });
	myElement.inject(document.body);
	
	// Tell the element to observe the hash URI
	$('myFirstElement').observe( ... );
	
	// Will trigger when hash URI = #!/home2&&object=1&object2=true&magic=happening
	
	$('myFirstElement').observing(); // Will return true
	
	// And finally, remove the observer, which will stop the element from observing hash URI changes!
	$('myFirstElement').unobserve(); // Easy right?
	
	$('myFirstElement').observing(); // Will return false
	

##Additional Features
###How Hashes <a name="HowHashesAreParsed"></a>Are Parsed
Let's start off with a perfectly fine and "legal" example of a hash URI: http://fakesite.com/`#!/somepage&&someparam=something&somethingelse=too`

Wasn't so bad, was it? So, to construct a hash URI that the HashNav object will recognize as legal, the URI will have to conform to these rules:

* Begin with your `prefix` (`!/` by default)
	* `#!/`home&&param=1

* Contain a legal (no spaces) page name/state designator
	* #!/ `home`&&param=1

* If the hash URI contains any request parameters, they need to occur after the state designator, be delimited by `&` if more than one request parameter is passed, and separated from the state designator by a `&&` (double ampersand)
	* #!/home`&&param=1`
	* #!/home`&&param=1``&``param2=2`
	* **non-existent** in #!/home

Basically: http://fakesite.com/&nbsp;&nbsp;`#!/`&nbsp;&nbsp;`somepage`&nbsp;&nbsp;`&&`&nbsp;&nbsp;`someparam=something`&nbsp;&nbsp;`&`&nbsp;&nbsp;`somethingelse=too`

Do note that **empty parameters** (`param=` with no data following it) and **orphan parameters** (`param` with no `=` data following it) are legal, allowed, and encouraged. So http://fakesite.com/&nbsp;&nbsp;`#!/`&nbsp;&nbsp;`somepage`&nbsp;&nbsp;`&&`&nbsp;&nbsp;`someparam=`&nbsp;&nbsp;`&`&nbsp;&nbsp;`somethingelse` is just as legal as its predecessor above.

Now, the quintessential core facet of the HashNav object is its ability to parse a hash URI and store it in a logical and meaningful manner.

In order to do this efficiently, the HashNav object employs a simple sorting algorithm to parse a legal hash into a accessible key/value object. This object is then passed into every observer's function (as the *first* argument -- usually denoted *e* for *event* -- followed by any custom arguments) when a change is detected within a hash URI. This object is also accessible by calling [getStoredHashData()](#PMI:getStoredHashData "Jump to it!") (or [getStoredHash()](#PMI:getStoredHash "Jump to it!"), which returns a subset of the former).
The object itself is constructed as follows:

<pre><code>storedHash:
[
   '',
   {
      page: '',
      pathString: '',
      pathParsed: null
   }
]
</code></pre>

where

* `storedHash[0]` returns the full hash URI unmodified (including leading pound/hash `#`)
* `storedHash[1]` returns an object containing the hash URI parsed into useful tidbits
* `storedHash[1]['page']` returns a string containing the current page/state "designation
* `storedHash[1]['pathString']` returns a string containing the query string of the hash URI or "path" (everything after -- but not including -- the &&)
* `storedHash[1]['pathParsed']` returns an object of key/value pairs representing the hash path in a more accessible and developer-friendly form. This is what is returned when one calls [getStoredHash()](#PMI:getStoredHash "Jump to it!").

An example of a real `storedHash` object in action:

<pre><code>storedHash:
[
   '#!/home&amp;&amp;param=1&amp;param2=&amp;param3&amp;param4=4&amp;param4=5&amp;6=7',
   {
      page: 'home',
      pathString: 'param=1&amp;param2=&amp;param3&amp;param4=4&amp;param4=5&amp;6=7',
      pathParsed:
      {
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6: '7',
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;param: '1',
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;param2: '',
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;param3: true,
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;param4: ['4', '5']
      }
   }
]
</code></pre>

(Note that if `queryMakeFalse` was set to `true`, `param2` would be set to `false` instead of an empty string)

###Relative <a name="RelativeHashes"></a>Hashes
Assuming you've read [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!") above, relative hashes are basically fully realized hash URIs that are missing their page/state designator. For example:

	#!/home&&param=1  //I'm an absolute hash!
	#!/&&param=1	  //I'm a relative hash! Ooh!

Wait, `home` is missing! How can that be? Well, the HashNav object is smart enough to interpret the missing designator as the current page (much like relative URLs in traditional web design), and process the hash URI as if it had included the aforesaid designator all along. For example:

	#!/&&param=1	  //I'm a relative hash! Ooh!

becomes

	#!/contact&&param=1

when the current page is "contact", and becomes

	#!/about&&param=1

when the current page is "about".

By now you've got to be asking yourself "what if my user navigates to my website using a relative hash within their URL from a location that is *not* governed by the HashNav object?" Valid question, with an equally valid answer! If your vistor is landing on your site utilizing a relative hash (or whenever the current page is read as empty), the HashNav object assumes the target to be the `defaultHome` option set at instantiation. For example:

	#!/&&param=1	  //I'm a relative hash! Ooh!

becomes

	#!/home&&param=1

when the current page is unknown or the user is using a relative hash when first landing on your site.  
This carries with it some heavy implications!

* Use relative hashes sparingly *or not at all* outside of your `defaultHome` page (simply "home" by default).
	* If you do, prepare for the certainty that some user somewhere will use your relative hash somewhere *other than that one page*.
* Make sure that your different pages don't use the same parameter names to do different things!
* Make sure your home page is equip to deal with (or promptly ignore) erroneous parameters from other pages.

As you can see, relative hashes are certainly powerful, and definitely have their shining moments, but are dangerous when used willy-nilly. Watch out!

###History <a name="HistoryTracking"></a>Tracking
When `trackHistory` is set to `true`, the history object and its various methods become available to you.

What history tracking actually does is takes the current hash data object (via [getStoredHashData()](#PMI:getStoredHashData "Jump to it!")) and pushes it onto a private "history" array. This means accessing history data is the same as accessing the currently stored hash data, except in the past tense. Using the [history methods](#PMI:history "Jump to it!") or [navigateTo()](#PMI:navigateTo "Jump to it!"), one can turn back the clock and restore any previous state in the web application's history. However, be aware that when a hash change occures that the parser refuses to acknowledge as [legal](#HowHashesAreParsed "Jump to it!"), it will **not** be logged internally (but it will be logged in the browser).

Do <a name="vci"></a>note that History Tracking enables some of the more powerful paramter filtering functionality of the [registerObserver()](#PMI:registerObserver "Jump to it!") and [observe()](#DMI:observe "Jump to it!") methods to work. Disabling history tracking will cripple both methods' [parameter filtering capabilities](#ObserverTriggers "Jump to it!").

###Usage <a name="UsageModes"></a>Modes###
At its most conservative, the HashNav class only requires a small subset of the MooTools Core library to function properly. In case you do not feel like scrolling up, that subset is as follows:

> * Conservative
> 	* **Core**: `Core`, **All** `Types`, `Browser`, **All** `Class`, **All** `Slick` *(dependency of `Element` & `DOMReady`)*, `Element` & `Element.Event`, `DOMReady`
> 	* **More**: `More`, `String.QueryString`
> * \+ Window Scrolling
> 	* **Core**: `Fx`
> 	* **More**: `Fx.Scroll`
> * \+ Serialization
> 	* **Core**: `Cookie`, `JSON`
> 	* **More**: (none)

As you can see, if you require the use of [Window Scrolling](#PMI:scrlTo "Jump to it!") (Conservative + [Window Scrolling](#PMI:scrlTo "Jump to it!")), then you'll need to make sure the [Fx](http://mootools.net/docs/core/Fx/Fx "MooTools Core Documentation: Fx") and [Fx.Scroll](http://mootools.net/docs/more/Fx/Fx.Scroll "MooTools More Documentation: Fx.Scroll") modules are available for use.
If you would like to utilize the full power of the HashNav class (Vanilla HashNav; Conservative + [Window Scrolling](#PMI:scrlTo "Jump to it!") + [Serialization](#PMI:serialize "Jump to it!")) then you'll need to include the [Cookie](http://mootools.net/docs/core/Utilities/Cookie "MooTools Core Documentation: Cookie") and [JSON](http://mootools.net/docs/core/Utilities/JSON "MooTools Core Documentation: JSON") modules in your MooTools package as well.

##Pro Tips
* **FOR THE LOVE OF GOD: REMOVE OBSERVER EVENTS USING [unregisterObserver()](#PMI:unregisterObserver "Jump to it!") OR [unobserve()](#DMI:unobserve "Jump to it!"), NOT [window.removeEvents()](http://mootools.net/docs/core/Element/Element.Event#Element:removeEvent "MooTools Core Documentation: removeEvents")!**
* The word/string `all` is treated as a "keyword" within most HashNav methods, so avoid using it as an argument accidentally.
* Query strings are *always* trimmed of erroneous whitespace (using [String.trim()](http://mootools.net/docs/core/Types/String#String:trim "MooTools Core Documentation: trim"))!
* The end values for all parsed query parameters are, due to [MooTools's QueryString library](http://mootools.net/docs/more/Types/String.QueryString "MooTools More Documentation: QueryString"), interpreted as strings (until HashNav [moves away from the QueryString library](#comingsoon "Jump to it!")).
* Query params do not overwrite one another! In `param1=1&param2=2&param1=3`, the value `3` will **not** overwrite the value `1`! In this case, **both** values are stored within an array (instead of a regular string) which represents the recognized value of the parameter. (ie. `{ param1:["1", "3"], param2:"2" }`)
* Page or "state" names (`home` in `#!/home&&param=1`) are completely and utterly **stripped** of whitespace using MooTools's [String.clean()](http://mootools.net/docs/core/Types/String#String:clean "MooTools Core Documentation: clean") method; however, events may still trigger when these invalid pages are navigated to in the browser. **Avoid the use of whitespace at all costs!**
* Use the [triggerEvent()](#PMI:TriggerEvent "Jump to it!") method whenever you register a new observer (or after you're finished regstering *all* your observers or initializing a page -- much more efficient, here's an [example](#PMI:TriggerEvent "Jump to it!")).
	* If you're a cool professional who knows what (s)he is doing, you'll find times when you *don't* want to use [triggerEvent()](#PMI:TriggerEvent "Jump to it!") after registering an observer or two! Ooh!

##Coming <a name="ComingSoon"></a>Soon
* Paradigm shift in favor of complex URI parsing using some form of [JSON](http://mootools.net/docs/core/Utilities/JSON "MooTools Core Documentation: JSON") over [MooTools's QueryString library](http://mootools.net/docs/more/Types/String.QueryString "MooTools More Documentation: QueryString").
* The privatization of both the HashNav object's `state` and (possibly) `storedHash` members (can still be interrogated using the available accessors).
* The ability to both serialize and unserialize the observer stack (and all the functions and their relationships to various DOM elements).
* Splitting serialized data into chunks for storage in multiple cookies if said data is too large to fit into an individual cookie.

*Check the changelog for more information on releases!*