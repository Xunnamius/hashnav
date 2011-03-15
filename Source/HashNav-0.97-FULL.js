/*
---
description: An AJAX-esque hash navigation class made in JavaScript using MooTools 1.3

license: MIT-style license

authors:
- Xunnamius

requires:
- core/1.3: [Class.Extras, Element.Event, Fx,Cookie, JSON]
- more/1.3.0.1: [String.QueryString, Fx.Scroll]

provides: [HashNav]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	var instance = null, history = [], observers = {}, version = 0.97, // Singleton
	state = { polling: false, native: false, current: '', storedHash: ['', { page: '', pathString: '', pathParsed: null }] },
	utility = {
		
		/* Slightly modified version from MooTools More | script: String.QueryString.js | license: MIT-style license */
		PQS: function(queryString, makeFalse) // Parse Query String
		{
			queryString = queryString.trim();
			var vars = queryString.split(/[&;]/), object = {};
			if (!vars.length || !queryString.length) return object;
			
			vars.each(function(val){
				var index = val.indexOf('='),
					value = index < 0 ? true : val.substr(index + 1),
					key = val.substr(0, index),
					keys = index < 0 ? [val] : key.match(/([^\]\[]+|(\B)(?=\]))/g),
					obj = object;
				
				if(makeFalse && value.length === 0) value = false;
				if(typeof(value) != 'boolean') value = decodeURIComponent(value);
				
				keys.each(function(key, i){
					key = decodeURIComponent(key);
					var current = obj[key];
					
					if(i < keys.length - 1) obj = obj[key] = current || {};
					else if(typeof(current) == 'object') current.push(value);
					else obj[key] = current != null ? [current, value] : value;
				});
			});
	
			return object;
		},
		
		POTQS: function(obj) // Parse Object To Query String
		{
			var qs = '';
			
			Object.each(obj, function(item, index)
			{
				if(item === true) 
				{
					if(qs) qs = qs + '&' + index;
					else qs += index;
					delete obj[index];
				}
				
				else if(item === false) 
				{
					var news = index + '=';
					if(qs) qs = qs + '&' + news;
					else qs += news;
					delete obj[index];
				}
			});
			
			obj = Object.toQueryString(obj);
			return qs + (obj && qs ? '&'+obj : obj);
		},
		
		compare: function(a, b, strict)
		{
			if(!a || !b || Object.getLength(a) != Object.getLength(b)) return false;
			return Object.every(a, function(value, key){ return typeof(value) == 'object' ? utility.compare(value, b[key], strict) : (strict ? b[key] === value : b[key] == value); }, this);
		}
	};
	
	/* Check the documentation for information on HashNav's public methods and options! */
	this.HashNav = new Class({
		
		Implements: [Options, Events],
		
		options:
		{
			interval: 200,
			prefix: '!/',
			defaultHome: 'home',
			trackHistory: true,
			exposeObserverMethods: true,
			cleanQueryString: false,
			queryMakeFalse: false,
			externalConstants: ['NAVOBJOBSDATA', 'NAVOBJSERDATA'],
			cookieOptions: { path: '/', domain: false, duration: 365, secure: false, document: document, encode: false }, // Leave encoding off, HashNav uses its own internal encoding instead
			cookieDataHardLimits: [2000, 6],
			ignoreVersionCheck: false,
			explicitHashChange: true
		},
		
		initialize: function(options)
		{
			if(instance) return instance;
			else
			{
				this.setOptions(options);
				
				if(this.options.trackHistory)
				{
					this.history =
					{
						get: function(entry)
						{
							if(entry == 'all') return Array.clone(history).each(function(item, i){ if(parseInt(item)+1) this[i] = this[item]; }); // Reversse the internal history optimization for the cloned history object
							
							entry = parseInt(entry),
							negen = history.length + entry;
							
							if(entry >= 0) negen = history[entry];
							else if(negen < history.length && negen >= 0) negen = history[negen];
							else negen = null;
							
							if(negen && typeof(negen) == 'object') return negen;
							if(parseInt(negen)+1) return history[negen];
							else return false;
						},
						
						truncate: function(count)
						{
							if(count >= history.length) return instance.history.clear();
							else if(count > 0)
							{
								history.splice(0, count);
								return true;
							}
							
							else return false;
						},
						
						clear: function()
						{
							history = [];
							return true;
						}
					};
				}
				
				if(this.options.exposeObserverMethods)
				{
					Element.implement({
						
						observe: function(trigger, fn, args, scrollToElement)
						{
							var tempref = new HashNav(),
							name = this.getProperty('id') || this.getProperty('class') || this.getProperty('name') || this.get('tag');
							if(scrollToElement === true) scrollToElement = this;
							this.store(tempref.options.externalConstants[0], name);
							tempref.registerObserver(name, trigger, fn, args, this, scrollToElement);
							tempref = null;
							return this;
						},
						
						observing: function()
						{
							var tempref = new HashNav(), result = tempref.registeredObserver(this.retrieve(tempref.options.externalConstants[0]));
							tempref = null;
							return result;
						},
						
						unobserve: function()
						{
							var tempref = new HashNav(),
							key = tempref.options.externalConstants[0],
							name = this.retrieve(key);
							if(name) tempref.unregisterObserver(name);
							this.eliminate(key);
							tempref = null;
							return this;
						},
						
					});
				}
				
				// Does this browser have support for the hashchange event?
				if(!Browser.ie7 && 'onhashchange' in window)
				{
					state.native = true;
					window.onhashchange = this.poll.bind(this); /* prevents our this.* references below from gettting lost :D */
					this.poll();
				}
				
				else this.startPolling();
				instance = this;
			}
		},
		
		startPolling: function()
		{
			if(state.native) return false;
			else
			{
				this.poll();
				state['polling'] = setInterval(this.poll.bind(this), this.options.interval);
				return true;
			}
		},
		
		stopPolling: function()
		{
			if(state['polling'])
			{
				clearInterval(state['polling']);
				state['polling'] = false;
				return true;
			}
			
			return false;
		},
		
		poll: function()
		{
			var lhsplit, lochash = window.location.hash;
			if(state['storedHash'][0] != lochash)
			{
				state['storedHash'][0] = (lochash.length ? lochash : '#');
				
				if(this.isLegalHash())
				{
					lhsplit = lochash.split('&&');
					state['storedHash'][1]['page'] = lhsplit.shift().substr(this.options.prefix.length+1).clean() || state.current || this.options.defaultHome;
					state.current = state['storedHash'][1]['page'];
					state['storedHash'][1]['pathString'] = lhsplit.join('&&');
				
					if(this.options.cleanQueryString) state['storedHash'][1]['pathParsed'] = state['storedHash'][1]['pathString'].cleanQueryString();
					else state['storedHash'][1]['pathParsed'] = utility.PQS(state['storedHash'][1]['pathString'], this.options.queryMakeFalse);
					
					// History optimization using a pseudo-pointer system
					lochash = this.getStoredHashData().clone();
					
					history.every(function(item, i)
					{
						if(item[0] == lochash[0])
						{
							lochash = i;
							return false;
						}
						
						return true;
					}.bind(this));
					
					if(this.options.trackHistory) history.push(lochash);
				}
				
				else
				{
					state['storedHash'][1]['page'] = '';
					state.current = '';
					state['storedHash'][1]['pathString'] = '';
					state['storedHash'][1]['pathParsed'] = null;
				}
				
				this.triggerEvent();
			}
		},
		
		registerObserver: function(name, trigger, fn, args, bind, scrlto)
		{
			if(!trigger || typeof(trigger.page) == 'undefined' || !trigger.params) return false;
			else
			{
				/*
				 * Trigger Optimization:
				 * 		- Trigger Folding (removing unnecessary parameters by folding them into each other)
				 *			- Folding mostly applies to '*':true and '*':false, where there exist non-wildcard keys with the same boolean values (useless).
				 *			- Also applies to '*':'' ("folds" itself out if there are other parameters present)
				 * 			- Also "folds" "double-exclusive" triggers (triggers that specify '*':'~' alone along with the exclusive qualifier) by
				 				deleting the whole qualifiers sub-object if it exists and emptying the params sub-object.
				 *		- maxparams qualifier values less than or equal to 0 (or less than minparams) result in the deletion of everything within
				 			trigger.params and minparams qualifier (if it exists) and replaces the maxparams qualifier with the exclusive qualifier.
				 *		- minparams qualifier values less than or equal to 0 will result in the deletion of the minparams qualifier
				 *		- The exclusive qualifier is deleted when either '*':(string) is found within trigger.params (unlike '*':'') or the
				 			minparams/maxparams qualifier(s) exists.
				 *		- Note that the behavior of registerObserver() becomes undefined if the number of parameters in trigger.params is greater than the
				 			number specified in maxparams (if qualifier exists; excluding wildcards)
				 */
				 var megadie = function()
				{
					delete trigger.qualifiers;
					delete trigger.params;
					trigger.params = {};
					trigger.params['*'] = '~';
				};
				
				if(trigger.qualifiers)
				 {
					if(typeof(trigger.qualifiers.maxparams) == 'number' && trigger.qualifiers.maxparams <= 0)
					 {
						 trigger.params = {};
						 delete trigger.qualifiers.maxparams;
						 if(trigger.qualifiers.minparams) delete trigger.qualifiers.minparams;
						 trigger.qualifiers.exclusive = true;
					 }
					 
					 if(trigger.qualifiers.minparams <= 0 || trigger.qualifiers.maxparams < trigger.qualifiers.minparams) delete trigger.qualifiers.minparams;
					 if(trigger.qualifiers.exclusive && (trigger.qualifiers.minparams || trigger.qualifiers.maxparams)) delete trigger.qualifiers.exclusive;
				 }
				 
				 if(Object.every(trigger.params, function(item){ return item === '~'; })) megadie();
				 else Object.each(trigger.params, function(value, key)
				 {
					 if(key == '*')
					 {
						 if(typeof(value) == 'boolean')
						 {
							 var temp = trigger.params['*'];
							 delete trigger.params['*'];
							 if(!Object.contains(trigger.params, temp)) trigger.params['*'] = temp;
						 }
						 
						 else if(value === '~' && trigger.qualifiers) megadie();
						 else if(value === '' && Object.getLength(trigger.params) > 1) delete trigger.params['*'];
						 
						 else if(
						  (trigger.qualifiers && (typeof(trigger.qualifiers.minparams) != 'undefined' || typeof(trigger.qualifiers.maxparams) != 'undefined')) ||
						  (typeof(value) != 'boolean' && value !== '~' && value !== '' && trigger.qualifiers && trigger.qualifiers.exclusive))
							delete trigger.qualifiers.exclusive;
					 }
				});
			}
			
			if(!observers[name]) observers[name] = [];
			observers[name].push([function(e)
			{
				e = e[1];
				if(!e) return;
				
				var hist = this.history.get(-2),
				/*
				 * Basically if trackHistory is disabled or if history.get(-1) is null, returns -1.
				 * Otherwise returns this.history.get(-2) if it is not null, otherwise returns -2
				 * (this makes it so "page change only" triggers trigger only if the current hash
				 * URI is legal and different from this.history.get(-2), whatever it may be)
				*/
				hist = this.options.trackHistory ? (hist ? hist : (this.history.get(-1) ? -2 : -1)) : -1, 
				path = e.pathParsed, satisfied = false, strict = false, wildstrict = false;
				
				if(trigger.qualifiers)
				{
					if(trigger.qualifiers.strict) strict = true;
					if(trigger.qualifiers.wildstrict) wildstrict = true;
					if(trigger.qualifiers.maxparams < Object.getLength(path) || trigger.qualifiers.minparams > Object.getLength(path)) return;
				}
				
				// Trigger logic
				if(trigger.page === false ||
				(trigger.page 	=== true 	&& (hist == -2 || (hist != -1 && hist[1].page && e.page && e.page != hist[1].page))) ||
				(trigger.page 	=== '' 		&& e.page == this.options.defaultHome) ||
				trigger.page	==  e.page)
				{
					if(trigger.page === false) satisfied = true; // We don't negotiate with terrorists (or illegal hash URIs).
					hist = Object.every(trigger.params, function(item, index)
					{
						if(satisfied) return true;
						else if(index === '*')
						{
							if(item === '~' && (!path || Object.getLength(path) == 0)) return satisfied = true;
							else if(Object.getLength(path))
							{
								// Ninja Art: Empty Wildcard Parameter Plus Exclusive Qualifier Jutsu!
								if(item === '' && ((trigger.qualifiers && trigger.qualifiers.exclusive && Object.getLength(path) == 1) || (!trigger.qualifiers && Object.getLength(path)))) return satisfied = true;
								else
								{
									var temp = trigger.params['*'];
									delete trigger.params['*'];
									
									if((item === true  && Object.contains(path, true)) ||
									 (item === false && Object.contains(path, (this.options.makeFalse ? false : ''))) ||
									 (item !== '' && (Object.values(path).every(function(value){ return (wildstrict ? value === item : value.toString() == item.toString()); }))))
									 {
										 trigger.params['*'] = temp;
										 return true;
									 }
								 
									trigger.params['*'] = temp;
								}
							}
							
							return false;
						}
						
						else
						{
							 if(item === '~' && (!path || typeof(path[index]) == 'undefined')) return true;
							 else if(Object.getLength(path))
							 {
								 if(
								  (item === true  && path[index] === true) ||
								  (item === false && (path[index] === '' || (this.options.makeFalse && path[index] === false))) ||
								  (item === '' 	  && typeof(path[index]) != 'undefined') ||
								  (path[index] 	  && (strict ? item === path : item.toString() == path[index].toString())))
									return true;
							 }
							 
							return false;
						}
					}.bind(this));
					
					if(hist)
					{
						// Qualifier logic
						if(!satisfied && trigger.qualifiers)
						{
							if(trigger.qualifiers.exclusive)
							{
								var params = Object.clone(trigger.params);
								params = Object.filter(params, function(value, key)
								{
									if(value == '~') return false;
									return true;
								});
								
								if(Object.getLength(params) !== Object.getLength(path)) return;
							}
							
							// More coming soon
						}
						
						if(scrlto) HashNav.scrlTo(scrlto);
						fn.apply(bind, [this.getStoredHashData()].append(Array.from(args)));
					}
				}
			}.bind(this), trigger, args, bind, scrlto]);
			
			window.addEvent('navchange', observers[name].getLast()[0]);
			return true;
		},
		
		registeredObserver: function(name){ return typeof(observers[name]) != 'undefined'; },
		
		unregisterObserver: function(name)
		{
			if(typeof(observers[name]) != 'undefined')
			{
				observers[name].each(function(item){ window.removeEvent('navchange', item[0]); });
				delete observers[name];
				return true;
			}
			
			return false;
		},
		
		unregisterObservers: function()
		{
			var removalObj = arguments;
			if(arguments[0] == 'all') removalObj = Object.keys(observers);
			Object.each(removalObj, function(item){ this.unregisterObserver(item); }, this);
		},
		
		navigateTo: function(loc)
		{
			var wlh = window.location.hash, triggerEvent = false;
			
			// Polymorphism at work!
			if(typeof(arguments[arguments.length-1]) == 'boolean')
			{
				triggerEvent = arguments[--arguments.length];
				delete arguments[arguments.length];
			}
			
			if(typeof(arguments[0]) == 'string' && arguments[1] && !arguments[2]) wlh = this.options.prefix + arguments[0] + '&&' + (typeof(arguments[1]) == 'object' ? utility.POTQS(arguments[1]) : arguments[1]);
			else if(typeof(arguments[0]) == 'string' && typeof(arguments[1]) == 'string' && arguments[2]) wlh = arguments[0] + arguments[1] + '&&' + (typeof(arguments[2]) == 'object' ? utility.POTQS(arguments[2]) : arguments[2]);
			
			else if(typeof(loc) == 'number' && this.options.trackHistory)
			{
				var hist = (this.history.get(loc) || [null])[0];
				if(hist) wlh = hist;
				else return false;
			}
			
			else if(typeof(loc) == 'object') wlh = this.options.prefix + state.current + '&&' + utility.POTQS(loc);
			
			else if(typeof(loc) == 'string')
			{
				if(loc.substr(0, 1) == '#') wlh = loc;
				else if(loc.substr(0, 1) == '&' && loc.substr(1, 1) != '&') wlh += (this.has('all') ? loc : (wlh.contains('&&') ? loc.substr(1) : '&'+loc));
				else wlh = this.options.prefix + loc;
			}
			
			else return false;
			
			window.location.hash = wlh;
			if(triggerEvent) this.triggerEvent();
			else this.poll();
			return true;
		},
		
		getCurrent: function(){ return state.current; },
		getStoredHash: function(){ return state.storedHash[1]['pathParsed'] = state.storedHash[1]['pathParsed'] || {}; },
		getStoredHashData: function(){ return state.storedHash; },
		
		get: function()
		{
			if(arguments[0] == 'all') return this.getStoredHash();
			var result = {}, get = this.getStoredHash();
			Object.each(arguments, function(item){ if(item in get) result[item] = get[item]; }, this);
			return Object.getLength(result) ? (arguments.length == 1 ? result[arguments[0]] : result) : (arguments.length == 1 ? null : {});
		},
		
		set: function()
		{
			var data = {};
			if(typeof(arguments[0]) == 'string' && arguments.length >= 2) data[arguments[0]] = arguments[1];
			else data = arguments[0];
			Object.merge(this.getStoredHash(), data);
			this.navigateTo(this.getStoredHash());
		},
		
		unset: function()
		{
			if(arguments[0] == 'all') Object.each(this.getStoredHash(), function(item, key){ delete state.storedHash[1].pathParsed[key]; }, this);
			else Object.each(arguments, function(item){ delete state.storedHash[1].pathParsed[item]; }, this);
			this.navigateTo(this.getStoredHash());
		},
		
		has: function()
		{
			if(arguments[0] == 'all') return !!Object.getLength(this.getStoredHash());
			var result = Object.filter(arguments, function(item){ return item in this.getStoredHash(); }.bind(this));
			return  Object.getLength(arguments) == 1 ? (Object.getLength(result) == 1 ? true : false) : Object.values(result);
		},
		
		isNative: function(){ return state.native; },
		isLegalHash: function(hash)
		{
			hash = hash || this.getStoredHashData()[0];
			return hash.substr(1, this.options.prefix.length) == this.options.prefix;
		},
		
		serialize: function(cookieName, nowrite)
		{
			// Some even harder limits
			cookieName = cookieName || this.options.externalConstants[1];
			if(this.options.cookieDataHardLimits[0] < 1) this.options.cookieDataHardLimits[0] = 1;
			else if(this.options.cookieDataHardLimits[0] > 10000) this.options.cookieDataHardLimits[0] = 10000;
			if(this.options.cookieDataHardLimits[1] < 4) this.options.cookieDataHardLimits[1] = 4;
			else if(this.options.cookieDataHardLimits[1] > 200) this.options.cookieDataHardLimits[1] = 200;
			
			var cookie_cache = { 'options':[], 'state':[], 'history':[] }, cookies = 4,
			
			splitter = function(temp, datatype, recurse)
			{
				if(!recurse) temp = encodeURIComponent(JSON.encode(temp));
				
				if(temp.length > this.options.cookieDataHardLimits[0])
				{
					cookies++;
					
					if(cookies <= this.options.cookieDataHardLimits[1])
					{
						cookie_cache[datatype].push(temp.substring(0, this.options.cookieDataHardLimits[0]));
						temp = temp.substr(this.options.cookieDataHardLimits[0]);
						return splitter(temp, datatype, true);
					}
					
					return false;
				}
				
				cookie_cache[datatype].push(temp);
				return true;
			}.bind(this);
			
			this.deserialize(cookieName);
			splitter(this.options, 'options');
			splitter(state, 'state');
			splitter(history, 'history');
			
			if(cookies > this.options.cookieDataHardLimits[1]) return false;
			
			if(!nowrite)
			{
				Cookie.write(cookieName+'version', encodeURIComponent(JSON.encode({ 'v': version, 's': { 'options': cookie_cache.options.length, 'state': cookie_cache.state.length, 'history': cookie_cache.history.length } })), this.options.cookieOptions);
			
				Object.each(cookie_cache, function(value, key)
				{
					if(value.length > 1) value.each(function(item, i){ Cookie.write(cookieName+key+i, item, this.options.cookieOptions); }, this);
					else Cookie.write(cookieName+key, value[0], this.options.cookieOptions);
				}, this);
				
				return true;
			}
			
			else return cookie_cache;
		},
		
		unserialize: function(restoreParadigm, fireEventOnNav, cookieName, secure, customdata)
		{
			cookieName = cookieName || this.options.externalConstants[1];
			var tempdata = {}, td = null;
			
			if(customdata) tempdata = customdata;
			else
			{
				if(secure !== true) secure = false;
				if(restoreParadigm !== false) restoreParadigm = true;
				if(fireEventOnNav !== false) fireEventOnNav = true;
				
				tempdata['version'] = JSON.decode(decodeURIComponent(Cookie.read(cookieName+'version')), secure);
				if(!tempdata['version'] || version.toString() != tempdata['version']['v'].toString()) return false;
				td = tempdata['version']['s'];
				
				Object.each(td, function(value, key)
				{
					if(value > 1)
					{
						while(value--) tempdata[key] = Cookie.read(cookieName+key+value) + (tempdata[key] ? tempdata[key] : '');
						tempdata[key] = JSON.decode(decodeURIComponent(tempdata[key]), secure);
					}
					
					else tempdata[key] = JSON.decode(decodeURIComponent(Cookie.read(cookieName+key)), secure);
				});
			}
			
			if(restoreParadigm)
			{
				if(Object.every(tempdata, function(item){ return !!item; }) && tempdata.version && tempdata.options && tempdata.state && tempdata.history)
				{
					version = tempdata['version'].v;
					this.setOptions(tempdata['options']);
					state = tempdata['state'];
					history = tempdata['history'];
					return this.navigateTo(-1, fireEventOnNav);
					return true;
				}
			
				return false;
			}
			
			return tempdata;
		},
		
		deserialize: function(cookieName)
		{
			cookieName = cookieName || this.options.externalConstants[1];
			var tempdata = this.unserialize(false, false, cookieName, true, null), td;
			
			if(tempdata && tempdata.version && tempdata.version.s)
			{
				td = tempdata.version.s;
				
				Object.each(td, function(value, key)
				{
					if(value > 1)
						while(value--) Cookie.dispose(cookieName+key+td[0], tempdata.options.cookieOptions);
					else Cookie.dispose(cookieName+key, tempdata.options.cookieOptions);
				});
				
				Cookie.dispose(cookieName+'version', tempdata.options.cookieOptions);
				return true;
			}
			
			return false;
		},
		
		//showPrivates: function(){ console.warn([history], observers, state); },
		triggerEvent: function(){ window.fireEvent('navchange', [this.getStoredHashData()]); }
		
	});
})();

HashNav.extend({
	
	scrl: Fx ? new Fx.Scroll(window) : null,
	scrlTo: function(elID)
	{
		elID = typeof(elID) == 'string' ? document.id(elID) : elID;
		if(elID) HashNav.scrl.toElement(elID);
	}
	
});