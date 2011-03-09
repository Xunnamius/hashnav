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

What this does is register an observer named **observer** with the hashNav object, which handles all the nitty-gritty details of hash navigation for you.

This observer will watch the URI hash and call the function

	function(e){ if(e[0]) console.log('event triggered:', e, arguments); }

with arguments `[1, 2, 3, 4]` bound to the default namespace denoted by `null` whenever it observes any [legal](#HowHashesAreParsed "Jump to it!") page change that satisfies its [trigger object](#ObserverTriggers "Jump to it!"). For example:

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
* interval - (`integer`: defaults to **200**) This value determines how long the pause (in milliseconds) between function calls for the polling method will be. Ignored when the native `onhashchange` event is present.

* prefix - (`string`: defaults to **"!/"**) Determines the string that will be looked for after the pound/hash sign (#) in URIs. If the prefix is **not** found, the HashNav object will refuse to recognize the hash change as [legal](#HowHashesAreParsed "Jump to it!") and will ignore it, as will *most* observers (see [observer triggers](#ObserverTriggers "Jump to it!") below).

* defaultHome - (`string`: defaults to **"home"**) Your website's "meta-homepage." When visitors navigate to your page using a [Relative Hash](#RelativeHashes "Jump to it!"), the HashNav object will assume the user navigated to the `defaultHome` page. Check out [Relative Hashes](#RelativeHashes "Jump to it!") for more information on this integral setting.

* trackHistory - (`boolean`: defaults to **true**) Enables [history tracking](#HistoryTracking "Jump to it!") and exposes HashNav's native [history.*](#PMI-history "Jump to it!") methods if set to `true`. Do not touch this unless you're perfectly sure you recognize the [various compounding implications](#vci "Jump to it!").

* exposeObserverMethods - (`boolean`: defaults to **true**) Exposes the [observe()](#DMI-observe "Jump to it!") and [observe()](#DMI-unobserve "Jump to it!") methods to MooTools's [Element](http://mootools.net/docs/core/Element/Element "MooTools Core Documentation: Element") type (via [implementation](http://mootools.net/docs/core/Class/Class#Class:implement "MooTools Core Documentation: Implement")) if set to `true`, allowing [observe()](#DMI-observe "Jump to it!") to be called from any DOM element as opposed to tying the observer to an element (a somewhat arduous journey) using [registerObserver()](#PMI-registerObserver "Jump to it!").

* cleanQueryString - (`boolean`: defaults to **false**) A **very** dangerous setting that will strip any nonconforming parameter entries and anything else MooTools's [String.cleanQueryString()](http://mootools.net/docs/more/Types/String.QueryString#String:cleanQueryString "MooTools More Documentation: cleanQueryString") method doesn't like if set to `true`. If set to `false`, a version of the [String.parseQueryString()]( http://mootools.net/docs/more/Types/String.QueryString#String:parseQueryString "MooTools More Documentation: String:parseQueryString") method is used instead (this is default). It is recommended you leave this off (`false`) unless you [know what you're doing](#HowHashesAreParsed "Jump to it!").

* queryMakeFalse - (`boolean`: defaults to **false**) When query strings are transcoded to key/value pairs, a blank parameter (`param=`) will become a blank string (`param:""`) by default (`false`). When `queryMakeFalse` is set to `true`, however, a blank parameter will be become a literal false (`param:false`). See [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!") for more information.

* externalConstants - (`array`) Determines the key the [observe()](#DMI-observe "Jump to ‘DOM Level Methods') DOM element method will use to store its pertinent data ("NAVOBJOBSDATA") along with the cookie prefix used when the [serialize()](#PMI-serialize "Jump to it!") method is called ("NAVOBJSERDATA").

* cookieOptions - (`object`) An object containing key/value pairs representing the default options passed to MooTools's [Cookie]( http://mootools.net/docs/core/Utilities/Cookie "MooTools Core Documentation: Cookie") object.

* ignoreVersionCheck - (`boolean`: defaults to **false**) When attempting to restore a session using [unserialize()](#PMI-unserialize "Jump to it!"), version checking is used to prevent session data generated by older versions of the HashNav object from being recreated due to potential inconsistencies [future updates](#ComingSoon "Jump to it") may introduce into the serialization process. This version check can be skipped (at your own peril) by setting this option to `true`, which is definitely **not** recommended.

##Events
###navchange
Fired on the `window` object when the HashNav object recognizes a hash change.
####Signature
	onNavchange(storedHashData)
####Arguments
1. storedHashData - (`object`) The hash data-object representing the most recent URI hash change.

##Public Method Index

<a name="PMI-history"></a>
###Public Method: <a name="PMI-history.get"></a>history.get
Grabs a storedHash data object from history and returns it.

####Syntax
	hashNav.history.get(entry);

####Arguments
1. entry - (`mixed`) History index to grab. Accepts positive numbers (0 being the first index to `history.legnth-1` being the last); *negative* numbers (-1 being the last index to `history.length` being the first); and the `all` keyword, 

which would return the whole history array.

####Returns
* (`object`) The specified history object.
* (`array`) An array consisting of all the history objects.
* (`boolean`) `false` when out of bounds or history object does not otherwise exist.

####See Also
* [History Tracking](#HistoryTracking "Jump to it!")

<br />
###Public Method: <a name="PMI-history.clear"></a>history.clear
Clears the internal history array and resets the pointer to 0.

####Syntax
	hashNav.history.clear();

####See Also
* [History Tracking](#HistoryTracking "Jump to it!")

<br />
###Public Method: <a name="PMI-startPolling"></a>startPolling
Starts the internal polling routine if it is not already started. Note that this method only needs to be called if internal polling has been stopped using [stopPolling()](#PMI-stopPolling "Jump to it!").

####Syntax
	hashNav.startPolling();

<br />
###Public Method: <a name="PMI-stopPolling"></a>stopPolling
Stops the internal polling routine if it is not already stopped. Call the [startPolling()](#PMI-startPolling "Jump to it!") method to restart the polling routine.

####Syntax
	hashNav.stopPolling();

<br />
###Public Method: <a name="PMI-poll"></a>poll
Used by the HashNav object to interrogate the `window.location` object and assess the current state of the hash URI. Does not need to be called manually.

####Syntax
	hashNav.poll();

<br />
###Public Method: <a name="PMI-registerObserver"></a>registerObserver
Registers an observer with the HashNav object and sets up a virtual "middle-man," if you will, to mediate between your observing functions and the `window` object in a cross-browser fashion.

####Syntax
	hashNav.registerObserver(name, trigger, fn[, args[, bind[, scrlto]]]);

####Arguments
1. name - (`string`) The observer's name. This value will be used to [unregister the observer](#PMI-unregisterObserver "Jump to it!") later. Without it, the observer cannot be [unregistered](#PMI-unregisterObserver "Jump to it!").
	* Note that observers can in fact have the same name without conflict. This is useful for grouping related observers together under one name. Do note, however, that when [unregisterObserver()](#PMI-unregisterObserver "Jump to 

it!") is called on a name that is tied to multiple observers, **all** of the observers that share the specified name will be [unregistered](#PMI-unregisterObserver "Jump to it!").
2. trigger - (`object`) This object is as special as it is important. So important, in fact, that it gets its [own section](#ObserverTriggers) below.
3. fn - (`function`) Function to be called when the observer's trigger is satisfied by the current hash URI. This function should accept [getStoredHashData()](#PMI-getStoredHashData "Jump to it!") as the *first* argument -- usually 

denoted *e* for *event* -- followed by any custom arguments.
4. args - (`mixed`, optional) Arguments passed to the observer function when triggered. Can either be a single argument or an array of arguments. Warning: if your single argument is an array, wrap it within another array literal to prevent 

incorrect processing.
5. bind - (`object`, optional) Object or element to bind the `this` keyword to within the observer function.
6. scrlto - (`mixed`, optional) <a name="WindowScrolling"></a>An element to [scroll to](#PMI-scrlTo "Jump to it!") in an aesthetically pleasing manner when the observer's trigger is satisfied by the current hash URI.

####Returns
* (`boolean`) `true` if the registration completed successfully, otherwise `false`.

<br />
####Observer <a name="ObserverTriggers"></a>Triggers
An observer's trigger object is what is used to dictate if the observer should care about a hash URI change or not. Here's an example of a trigger obect:

	{ page: 'home2', params: {object:1, object2:true, magic:'happening', object3:'~'} }

An observer registered with the above trigger would call its observing function when the URI looked something like `#!/home2&&object=1&object2=true&magic=happening`.

#####Trigger Syntax
The Syntax for trigger objects may seem esoteric at first, but it's actually quite easy (maybe even intuitive).

Taking our above example

	{ page: 'home2', params: {object:1, object2:true, magic:'happening', object3:'~'} }

we see that we have:

* A `page` key, which maps to the page/state designator in a hash URI.
	* `page: 'home2'` means the observer will only activate when the hash URI is on `home2`.
* A `params` key, which maps to the hash URI's query string (everything after the && -- basically the object returned by calling [getStoredHash()](#PMI-getStoredHash "Jump to it!")).
	* `params: {object:1, object2:true, magic:'happening', object3:'~'}` means the observer will only activate when the hash URI has `object=1&object2=true&magic=happening` contained somewhere in its query string.

Pretty simple, 'eh? Just remember that the `page` and `params` keys are *required* to exist within your trigger objects. If they are missing, your observer will crash. Now let's get serious.

#####Advanced Trigger Syntax
Now that we've got a grasp on simple triggers, let's spice things up a little.

The `page` key accepts more than just a page/state designator string. You can also feed it:

* A blank string `''`, which is interpreted to mean the `defaultHome` page.
	* ex. `page:''`
* The boolean literal `true`, which is interpreted as "match any change to the page/state designator"
	* ex. `page:true`
* The boolean literal `false`, which is interpreted as "match any change to the hash URI"
	* ex. `page:false`
	* **WARNING:** This matches *any* change in the hash URI, even changes that are not recognized as [legal](#HowHashesAreParsed "Jump to it!") by the HashNav object! *Any* change to the hash will trigger this observer!

The `params` key is just as special. Each parameter you specify within the `params` object can be fed:

* A blank string `''`, which is interpreted as "if the parameter is present with any value (even an empty or non-existent one)"
	* ex. `params:{someparam:''}`
* The tilde mark `'~'`, which, when found alone, is parsed as a special keyword (much like `all` in most of HashNav's other methods) and interpreted as "if this parameter is **NOT** present"
	* ex. `params:{someparam:'~'}`
* The boolean literal `true`, which is interpreted as "if the parameter is an orphan"
	* ex. `params:{someparam:true}`
* The boolean literal `false`, which is interpreted as "if the parameter is empty"
	* ex. `params:{someparam:false}`

But we're still not finished!

#####Qualifiers and Wildcards
Trigger objects also have an optional third key called `qualifiers`, which applies special "group logic" to the trigger based on the qualifying strings that are passed in.

Those string are as follows:

* exclusive - (`boolean`, defaults to **false**) When `true`, the trigger will only activate its observing function when all of the parameters in the `params` object are present **exclusively**, meaning there are no other parameters 

present except those listed. Defaults to `false`.
	* ex. `{ page: 'somepage', params: { someparam: somevalue }, qualifiers: { exclusive: true } }`

(more qualifiers will be added as they become necessary)

There are also these cool little things called `wildcards`, represented, of course, by the asterisk `*`, and can appear **as a parameter within the `params` object.** When present within the `params` object, the `wildcard` may take the 

following forms:

* `*:'~'`, which is interpreted as "no parameters are allowed" (the same as supplying a trigger with an empty `params` object in conjunction with the `exclusive` `qualifier`)
	* ex. `params:{'*':'~'}`
* `*:''`, which is interpreted as "any parameter is allowed" (aka, there must be at least one parameter present in the hash URI)
	* ex. `params:{'*':''}`
* `*:true`, which is interpreted as "any orphan parameter is allowed" (aka, there must be at least one orphan parameter present in the hash URI)
	* ex. `params:{'*':true}`
* `*:false`, which is interpreted as "any empty parameter is allowed" (aka, there must be at least one empty parameter present in the hash URI)
	* ex. `params:{'*':false}`
* `*:string`, which is interpreted as "all parameters present must equal this string" (aka, all present parameters must equal this string and there must be at least one parameter present in the hash URI)
	* ex. `params:{'*':'hello world'}`

#####Notes
* Due to the way objects work, only one `wildcard` may appear per trigger. To include more than one would render the trigger functionality undefined.
* `wildcards` do **not** have to appear alone (ex. `params:{ '*':'~', someparam1:1, somepara2:2 }` is still legal... but useless).

Congratulations, you're now a trigger master!

####Examples
	// Grab the HashNav Class's instance
	var hashNav = new HashNav();

	// Register an Observer
	hashNav.registerObserver('observer', { page: 'page3', params: {} }, function(e){ if(e[0]) console.log('event triggered:', e, arguments); }, [1, 2, 3, 4], null, 'header');
	
	// The observer will be alerted when the hash URI looks something like   #!/page3   with any number of params!

<br />
###Public Method: <a name="PMI-registeredObserver"></a>registeredObserver
Checks the internal observer stack for the supplied name.

####Syntax
	myElement.registeredObserver(name);

####Returns
* (`boolean`) `true` if the observer name was found or `false` if it was not.

####Examples
	// Create a observer
	hashNav.registerObserver('myObserver', ... );
	
	// This...
	hashNav.registeredObserver('myObserver'); // Will return true
	
	// And finally, unregister the observer...
	hashNav.unregisterObserver('myObserver'); // Easy right?
	
	// Aaaand....
	hashNav.registeredObserver('myObserver'); // Will return false!!

<br />
###Public Method: <a name="PMI-unregisterObserver"></a>unregisterObserver
Removes the specified observer from HashNav's internal observer index, and removes all associated observer functionality.

####Syntax
	hashNav.unregisterObserver(name);

####Arguments
1. name - (`string`) The name of the observer or group of observers to unregister. If the `all` keyword is passed in, *all* observers will be unregistered.

####Returns
* (`boolean`) `true` if the observer was successfully unregistered, otherwise `false` (if the observer name doesn't exist or an internal issue was encountered).

####Notes
* **WARNING:** **DO NOT** use [window.removeEvents()](http://mootools.net/docs/core/Element/Element.Event#Element:removeEvent "MooTools Core Documentation: removeEvents") to remove observer event handlers! That's what this method is for.

<br />
###Public Method: <a name="PMI-unregisterObservers"></a>unregisterObservers
[Unregisters](#PMI-unregisterObserver "Jump to it!") multiple observers.

####Syntax
	hashNav.unregisterObservers(name1[, name2[, name3[, ...]]]);

####Arguments
1. name - (`string`) The name of the observer or group of observers to unregister. If the `all` keyword is passed in, *all* observers will be unregistered (rendering any argument following `all` useless).

####Examples
	// Unregisters observer1, Xunnamius, Linkin, and Park
	hashNav.unregisterObservers('observer1', 'Xunnamius', 'Linkin', 'Park');

####See Also
* [unregisterObserver()](#PMI-unregisterObserver "Jump to it!")

<br />
###Public Method: <a name="PMI-navigateTo"></a>navigateTo
Navigates the browser to the specified URI or history entry.

####Syntax
	hashNav.navigateTo(location[, forced]);
	hashNav.navigateTo(page, params[, forced]);
	hashNav.navigateTo(prefix, page, params[, forced]);

####Arguments
* First Mode
	1. location - (`mixed`) The target destination.
		* If this is a `number` (and `trackHistory` is true), the browser will navigate to the history entry that corresponds with the supplied parameter by passing `location` as an argument to [history.get()](#PMI-history.get "Jump to it!").
		* If this is an `object` made up of key/value pairs representing the desired hash URI query string (similar to what you'd would get if [getStoredHash()](#PMI-getStoredHash "Jump to it!") were called), the browser will navigate to the specified parameters (without changing the page/state designator).
		* If this is a `string`
			* and the `string` starts with `#`, the current hash URI will be replaced with `location` (ex. '#!/home&&param=1')
			* and the `string` starts with `&`, the browser will append `location` to the end of the current query string. (ex. '&param=1')
			* and none of the above rules are matched, the browser will navigate to your `prefix` initialization option + `location`  (ex. '#!/' + 'home&&param=1')
	2. forced - (`boolean`, optional: defaults to **false**) If [triggerEvent()](#PMI-triggerEvent "Jump to it!") should be called after navigation. Setting this to `true` is usually unnecessary, and may cause the `navchange` event to fire twice if used incorrectly.

* Second Mode
	1. page - (`string`) The page/state designator to navigate to. (ex. 'home')
	2. params - (`mixed`) The query string to apply to the new hash URI. This can either be a literal query string or an object comprised of key/value pairs. (ex. 'hello=world&hello2=2')

* Third Mode
	1. prefix - (`string`) The hash prefix to navigate to. (ex. '#')
	2. page - (`string`) The page/state designator to navigate to. (ex. 'home')
	3. params - (`mixed`) The query string to apply to the new hash URI. This can either be a literal query string or an object comprised of key/value pairs.  (ex. 'hello=world&hello2=2')

####Returns
* (`boolean`) `true` if navigation completed successfully or `false` on failure.

####Notes
* The only time you'd need to use `forced` would be if you were navigating to the same unchanging hash URI again and again, and wanted your observers to take note.
* Just because you can navigate to it doesn't make it a [legal](#HowHashesAreParsed "Jump to it!") hash URI!

####Examples
	// Current URI = #!/home&&param=1   (pretend that each navigateTo below is mutually exclusive)
	
	hashNav.navigateTo('#Illegal'); // Current URI becomes #Illegal
	hashNav.navigateTo('Legal'); // Current URI becomes #!/Legal
	hashNav.navigateTo('&&Legal'); // Current URI becomes #!/&&Legal
	hashNav.navigateTo('&Legal'); // Current URI becomes #!/home&&param=1&Legal
	hashNav.navigateTo(-1); // Current URL remains the same but no observers are triggered (because nothing has changed!)
	hashNav.navigateTo(-1, true); // Current URL remains the same and any curious observers are triggered (forced!)
	hashNav.navigateTo({ param2:2 }); // Current URL becomes #!/&&param2=2
	hashNav.navigateTo('somepage', { param2:2 }); // Current URL becomes #!/somepage&&param2=2
	hashNav.navigateTo('#', 'IllegalURI', { param2:2 }); // Current URL becomes #IllegalURI&&param2=2
	hashNav.navigateTo('#!/', 'home', { param:1 }); // Current URL remains the same but no observers are triggered (because nothing has changed!)
	hashNav.navigateTo('#!/', 'home', { param:1 }, true); // Current URL remains the same and any curious observers are triggered (forced!)
	
	// etc...

####See Also
* [history.get()](#PMI-history.get "Jump to it!")

<br />
###Public Method: <a name="PMI-getStoredHash"></a>getStoredHash
Returns an object containing key/value pairs representing the currently stored hash URI's query string data.

####Syntax
	hashNav.getStoredHash();

####Returns
* (`object`) A subset of the `storedHash` object.

####Examples
	//URI = #!/home&&param=1&param2=2
	
	hashNav.getStoredHash(); // Returns { param:1, param2:2 }

####See Also
* [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!")

<br />
###Public Method: <a name="PMI-getStoredHashData"></a>getStoredHashData
Returns an object containing pertinent data on the currently [recognized](#HowHashesAreParsed "Jump to it!") hash URI.

####Syntax
	hashNav.getStoredHashData();

####Returns
* (`object`) A storedHash object.

####Examples
	//URI = #!/home&amp;&amp;param=1&amp;param2=&amp;param3&amp;param4=4&amp;param4=5&amp;6=7

	hashNav.getStoredHashData();

Returns:

<pre><code>
storedHash:
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

####See Also
* [How Hashes Are Parsed](#HowHashesAreParsed "Jump to it!")

<br />
###Public Method: <a name="PMI-get"></a>get
Grabs the value of the specified query parameter.

####Syntax
	hashNav.get(parameter1[, parameter2[, parameter3]]);

####Arguments
1. parameter - (`string`) The name of a hash URI query parameter. If `all` is passed in, the results would be the same as calling [getStoredHash()](#PMI-getStoredHash "Jump to it!").

####Returns
* (`mixed`) Value of the specified query parameter or `null` if the query parameter does not exist.
* (`object`) When more than one parameter is specified, an object is returned instead, housing the results in convenient key/value pairs.

<br />
###Public Method: <a name="PMI-set"></a>set
Sets the value of the specified query parameter (merges current parameter object (a la [getStoredHash()](#PMI-getStoredHash "Jump to it!") with supplied input using [Object.merge()](http://mootools.net/docs/core/Types/Object#Object:Object-merge "MooTools Core Documentation: Object.merge")).

####Syntax
	hashNav.set(parameter, value);
	hashNav.set(paramobject);

####Arguments
* First Mode
	1. parameter - (`string`) The name of a hash URI query parameter.
	2. value - (`mixed`) The value to assign the parameter.

* Second Mode
	1. paramobject - (`object`) An object of key/value pairs similar in structure to what is returned by calling [getStoredHash()](#PMI-getStoredHash "Jump to it!").

####Notes
* Using `set` changes the hash URI and as such will trigger a `navchange` event (similar to [navigateTo()](#PMI-navigateTo "Jump to it!")).

<br />
###Public Method: <a name="PMI-unset"></a>unset
Unsets the specified query parameter.

####Syntax
	hashNav.unset(parameter1[, parameter2[, parameter3]]);

####Arguments
1. parameter - (`string`) The name of a hash URI query parameter. If `all` is passed in, all parameters will be unset.

####Notes
* Using `unset` changes the hash URI and as such will trigger a `navchange` event  (similar to [navigateTo()](#PMI-navigateTo "Jump to it!")).

<br />
###Public Method: <a name="PMI-has"></a>has
Checks if a specific parameter or parameters are present in the hash URI query string.

####Syntax
	hashNav.has(parameter1[, parameter2[, parameter3]]);

####Arguments
1. parameter - (`string`) The name of a hash URI query parameter.

####Returns
* (`boolean`) `true` if one parameter is passed in and the result is true.
* (`array`) If more than one parameter is specified, an array of present parameters is returned.

<br />
###Public Method: <a name="PMI-serialize"></a>serialize
Capture the current hash URI and correlated object session data for storage and later analyzation or unserialization.

####Syntax
	hashNav.serialize([cookieName]);

####Arguments
1. cookieName - (`string`, optional: defaults to `externalConstants[1]`) The prefix to attach to all data cookies.

####Notes
* [Serialize()](#PMI-serialize "Jump to it!") stores four cookies on your visitor's local machine: '\_history', '\_options', '\_state', and '\_version' (all prefixed by `externalConstants[1]`).
* Note that Observers and their relationships to the `window` and various other DOM elements are not [yet](#ComingSoon "Jump to it!") included in the serialization process.

<br />
###Public Method: <a name="PMI-unserialize"></a>unserialize
Rebuild (unserialize) serialized HashNav session data.

####Syntax
	hashNav.unserialize([restoreParadigm[, fireEventOnNav[, cookieName]]]);

####Arguments
1. restoreParadigm - (`string`, optional: defaults to **true**) If `true`, the unserialized data will replace the current data session.
2. fireEventOnNav - (`boolean`, optional: defaults to **true**) If `restoreParadigm` is `true`, this boolean will be passed to [navigateTo](#navigateTo "Jump to it!") in place of the `forced` parameter.
3. cookieName - (`string`, optional: defaults to `externalConstants[1]`) The prefix attached to the data cookies.

####Returns
* (`boolean`) `true` if the whole unserialization process succeeded, else `false`.
* (`object`) If restoreParadigm is `false`, an object consisting of the unserialized data is returned.

####Notes
* Attempting to share serialized data between different (even slightly different) versions of HashNav class instances will result in this function returning `false`.

<br />
###Public Method: <a name="PMI-deserialize"></a>deserialize
Destroys all the cookies that currently hold serialized data.

####Syntax
	hashNav.deserialize([cookieName[, cookieOptions]]);

####Arguments
1. cookieName - (`string`, optional: defaults to `externalConstants[1]`) The prefix attached to the data cookies.
2. cookieOptions - (`string`, optional: defaults to `cookieOptions`) The options used initially to create the data cookies.

####Notes
* Cookies can only be deleted in MooTools with the original options used to create the cookies. If the `cookieOptions` object has been changed since the cookies were last created, the object may fail to delete them.

<br />
###Public Method: <a name="PMI-triggerEvent"></a>triggerEvent
Triggers a `navchange` event on the window, which triggers any active observers. **Do not use `window.fireEvent('navchange')` directly or your observers may die.**

####Syntax
	hashNav.triggerEvent();

####Notes
* Use the [triggerEvent()](#PMI-TriggerEvent "Jump to it!") method whenever you [register a new observer](#PMI-registerObserver "Jump to it") (or after you're finished registering all your observers or initializing a page -- much more 

efficient, an example is below). This is required because most modern browsers fire their native `onhashchange` event before the HashNav object is allowed to fully initialize. So when your visitors land on your site using a hash URI and 

you don't call [triggerEvent()](#PMI-TriggerEvent "Jump to it!"), it'll be as if the hash never fired! To better understand the problem, try the following example code out on your own page.

* This stipulation also applies to [DOM element observers](#DMI-observe "Jump to it!") as well.

####Examples
	//First Time Visitor: URI = #!/home&&slideshow=slide5

	hashNav.registerObserver('test1', { page: 'home', params: {} }, function(e){ console.log('event triggered:', e, arguments); }, [1, 2, 3, 4], null, 'header');
	hashNav.registerObserver('test2', { page: '', params: {} }, function(e){ console.log('MatchDefaultHome!'); });
	
	// NOTHING HAPPENS?!?!
	
	// Until we call...
	hashNav.triggerEvent();
	
	// Yay it worked! Try navigating to your page (from an external site or new tab) with the above line commented out, and see what happens.

<br />
###Public Property (utility): <a name="PMI-scrl"></a>scrl
One of the few utilities that is publicly exposed. This property is used to house the internal `Fx.Scroll(window)` instance of the [Fx.Scroll](http://mootools.net/docs/more/Fx/Fx.Scroll "MooTools More Documentation: Fx.Scroll") Class (initialized just like that, yes). Being public, you can modify the scrolling effect to your heart's content (by calling [setOptions](http://mootools.net/docs/core/Class/Class.Extras#Options:setOptions "MooTools Core Documentation: setOptions") on your HashNav instance's [scrl](#PMI-scrl "Jump to it!") method).

<br />
###Public Method (utility): <a name="PMI-scrlTo"></a>scrlTo
Calls [toElement()](http://mootools.net/docs/more/Fx/Fx.Scroll#Fx-Scroll:toElement "MooTools More Documentation: Fx.Scroll:toElement()") on the [Fx.Scroll](http://mootools.net/docs/more/Fx/Fx.Scroll "MooTools More Documentation: Fx.Scroll") instance housed within the [scrl](#PMI-scrl "Jump to it!") utility property.

####Syntax
	hashNav.scrlTo(elementID);

####Arguments
1. elementID - (`mixed`) May either be an DOM element or an element's ID. The resulting object is passed to HashNav's internal scrolling method.

<br />
##DOM Method Index

###Element Method: <a name="DMI-observe"></a>observe
Calls [registerObserver()](#PMI-registerObserver "Jump to it!") on a DOM element, allowing said element to observe the hash URI and trigger a function if specific conditions are met. Note that this method passes [registerObserver()](#PMI-registerObserver "Jump to it!") the current object's ID/Class/Name/TagName as the `name` argument.

####Syntax
	myElement.observe(trigger, fn[, args[, scrollToElement]]);

####Arguments
1. trigger - (`object`) Trigger object. See [observer trigger](#ObserverTriggers "Jump to it!").
2. fn - (`function`) Function to be called when the observer's trigger is satisfied by the current hash URI. This function should accept [getStoredHashData()](#PMI-getStoredHashData "Jump to it!") as the *first* argument -- usually 

denoted *e* for *event* -- followed by any custom arguments (the function is bound to the current DOM object).
3. args - (`mixed`, optional) Arguments passed to the observer function when triggered. Can either be a single argument or an array of arguments. Warning: if your single argument is an array, wrap it within another array literal to prevent incorrect 

processing.
4. scrollToElement - (`mixed`, optional) An ID string/element DOM object that will be scroll to using `Fx.Scroll.toElement()`. If `scrollToElement` is `true`, the observing DOM element will be scrolled to instead.

####Returns
* (`element`) The DOM element in question.

####Examples
	// Create a new Element and insert it into the document
	var myElement = new Element('div', { id: 'myFirstElement' });
	myElement.inject(document.body);
	
	// Tell the element to observe the hash URI for our specific changes
	$('myFirstElement').observe({ page: 'home2', params: {object:1, object2:true, magic:'happening', object3:'~'} }, function(e){ alert('Hello World!'); console.log(arguments); }, [1,2,3], true);
	
	// Will trigger when hash URI = #!/home2&&object=1&object2=true&magic=happening

<br />
###Element Method: <a name="DMI-unobserve"></a>unobserve
Calls [unregisterObserver()](#PMI-unregisterObserver "Jump to it!") on an observing DOM element. Note that this method passes [unregisterObserver()](#PMI-unregisterObserver "Jump to it!") the current object's ID/Class/Name/TagName as the `name` argument.

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

<br />
###Element Method: <a name="DMI-observing"></a>observing
Returns the DOM element's observer status.

####Syntax
	myElement.observing();

####Returns
* (`boolean`) `true` if the element is currently observing the hash URI or `false` if it is not.

####Examples
	// Create a new Element and insert it into the document
	var myElement = new Element('div', { id: 'myFirstElement' }); // By the way, the observer's name (as acknowledged by the HashNav object) will be: myFirstElement
	myElement.inject(document.body);
	
	// Tell the element to observe the hash URI
	$('myFirstElement').observe( ... );
	
	// This...
	$('myFirstElement').observing(); // Will return true
	
	// And finally, remove the observer, which will stop the element from observing hash URI changes!
	$('myFirstElement').unobserve(); // Easy right?
	
	// This...
	$('myFirstElement').observing(); // Will return false!!
	
<br />
##Additional Features
###How Hashes <a name="HowHashesAreParsed"></a>Are Parsed
Let's start off with a perfectly fine and "legal" example of a hash URI: http://fakesite.com/`#!/somepage&&someparam=something&somethingelse=too`

Wasn't so bad, was it? So, to construct a hash URI that the HashNav object will recognize as legal, the URI will have to conform to these rules:

* Begin with your `prefix` (`!/` by default)
	* `#!/`home&&param=1

* Contain a legal (no spaces) page name/state designator
	* \#!/`home`&&param=1

* If the hash URI contains any request parameters, they need to occur after the state designator, be delimited by `&` if more than one request parameter is passed, and separated from the state designator by a `&&` (double ampersand)
	* \#!/home`&&param=1`
	* \#!/home`&&param=1&param2=2`
	* **non-existent** in #!/home

Basically: http://fakesite.com/&nbsp;&nbsp;`#!/`&nbsp;&nbsp;`somepage`&nbsp;&nbsp;`&&`&nbsp;&nbsp;`someparam=something`&nbsp;&nbsp;`&`&nbsp;&nbsp;`somethingelse=too`

Do note that **empty parameters** (`param=` with no data following it) and **orphan parameters** (`param` with no `=` following it) are also legal, allowed, and encouraged. So http://fakesite.com/&nbsp;&nbsp;`#!/`&nbsp;&nbsp;`somepage`&nbsp;&nbsp;`&&`&nbsp;&nbsp;`someparam=`&nbsp;&nbsp;`&`&nbsp;&nbsp;`somethingelse` is just as legal as its predecessor above.

Now, the quintessential core facet of the HashNav object is its ability to parse a hash URI and store it in a logical and meaningful manner.

In order to do this efficiently, the HashNav object employs a simple sorting algorithm to parse a legal hash into a accessible key/value object. This object is then passed into every observer's function (as the *first* argument -- usually denoted *e* for *event* -- followed by any custom arguments) when a change is detected within a hash URI. This object is also accessible by calling [getStoredHashData()](#PMI-getStoredHashData "Jump to it!") (or [getStoredHash()](#PMI-getStoredHash "Jump to it!"), which returns a subset of the former).
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
* `storedHash[1]['pathString']` returns a string containing the query string of the hash URI (everything after -- but not including -- the &&)
* `storedHash[1]['pathParsed']` returns an object of key/value pairs representing the hash query string in a more accessible and developer-friendly form. This is what is returned when one calls [getStoredHash()](#PMI-getStoredHash "Jump to it!").

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

What history tracking actually does is takes the current hash data object (via [getStoredHashData()](#PMI-getStoredHashData "Jump to it!")) and pushes it onto a private "history" array. This means accessing history data is the same as accessing the currently stored hash data, except in the past tense. Using the [history methods](#PMI-history "Jump to it!") or [navigateTo()](#PMI-navigateTo "Jump to it!"), one can turn back the clock and restore any previous state in the web application's history. However, be aware that when a hash change occurs that the parser refuses to acknowledge as [legal](#HowHashesAreParsed "Jump to it!"), it will **not** be logged internally (but it *will* be logged in the browser).

Do <a name="vci"></a>note that History Tracking enables some of the more powerful parameter filtering functionality of the [registerObserver()](#PMI-registerObserver "Jump to it!") and [observe()](#DMI-observe "Jump to it!") methods to work. Disabling history tracking will cripple both methods' [parameter filtering capabilities](#ObserverTriggers "Jump to it!").

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

As you can see, if you require the use of [Window Scrolling](#PMI-scrlTo "Jump to it!") (Conservative + [Window Scrolling](#PMI-scrlTo "Jump to it!")), then you'll need to make sure the [Fx](http://mootools.net/docs/core/Fx/Fx "MooTools Core Documentation: Fx") and [Fx.Scroll](http://mootools.net/docs/more/Fx/Fx.Scroll "MooTools More Documentation: Fx.Scroll") modules are available for use.
If you would like to utilize the full power of the HashNav class (Vanilla HashNav; Conservative + [Window Scrolling](#PMI-scrlTo "Jump to it!") + [Serialization](#PMI-serialize "Jump to it!")) then you'll need to include the [Cookie](http://mootools.net/docs/core/Utilities/Cookie "MooTools Core Documentation: Cookie") and [JSON](http://mootools.net/docs/core/Utilities/JSON "MooTools Core Documentation: JSON") modules in your MooTools package as well.

##Pro Tips
* **FOR THE LOVE OF GOD: REMOVE OBSERVER EVENTS USING [unregisterObserver()](#PMI-unregisterObserver "Jump to it!") OR [unobserve()](#DMI-unobserve "Jump to it!"), NOT [window.removeEvents()](http://mootools.net/docs/core/Element/Element.Event#Element:removeEvent "MooTools Core Documentation: removeEvents")!**
* The word/string `all` is treated as a "keyword" within most HashNav methods, so avoid using it as an argument accidentally.
* Query strings are *always* trimmed of erroneous whitespace (using [String.trim()](http://mootools.net/docs/core/Types/String#String:trim "MooTools Core Documentation: trim"))!
* The end values for all parsed query parameters are, due to [MooTools's QueryString library](http://mootools.net/docs/more/Types/String.QueryString "MooTools More Documentation: QueryString"), interpreted as strings (until HashNav [moves away from the QueryString library](#ComingSoon "Jump to it!")).
* Query params do not overwrite one another! In `param1=1&param2=2&param1=3`, the value `3` will **not** overwrite the value `1`! In this case, **both** values are stored within an array (instead of a regular string) which represents the recognized value of the parameter. (ie. `{ param1:["1", "3"], param2:"2" }`)
* Page or "state" names (`home` in `#!/home&&param=1`) are completely and utterly **stripped** of whitespace using MooTools's [String.clean()](http://mootools.net/docs/core/Types/String#String:clean "MooTools Core Documentation: clean") method; however, events may still trigger when these invalid pages are navigated to in the browser. **Avoid the use of whitespace at all costs!**
* Use the [triggerEvent()](#PMI-TriggerEvent "Jump to it!") method whenever you register a new observer (or after you're finished registering *all* your observers or initializing a page -- much more efficient, here's an [example](#PMI-TriggerEvent "Jump to it!")).
	* If you're a cool professional who knows what (s)he is doing, you'll find times when you *don't* want to use [triggerEvent()](#PMI-TriggerEvent "Jump to it!") after registering an observer or two! Ooh!

##Coming <a name="ComingSoon"></a>Soon
* Paradigm shift in favor of complex URI parsing using some form of [JSON](http://mootools.net/docs/core/Utilities/JSON "MooTools Core Documentation: JSON") over [MooTools's QueryString library](http://mootools.net/docs/more/Types/String.QueryString "MooTools More Documentation: QueryString").
* The privatization of both the HashNav object's `state` and (possibly) `storedHash` members (can still be interrogated using the available accessors).
* The ability to both serialize and unserialize the observer stack (and all the functions and their relationships to various DOM elements).
* Splitting serialized data into chunks for storage in multiple cookies if said data is too large to fit into an individual cookie.
* Ability to pass in serialized HashNav session data to the unserialize method for direct unserialization.

*Check the change log for more information on releases!*
