/*
---
description: An AJAX-esque hash navigation class made in JavaScript using MooTools 1.3

license:
- MIT-style license

authors:
- Tre (Xunnamius) Giles (http://darkgray.org/)

requires:
core/1.3:
- Class.Extras
- Element.Event
- Fx
- Cookie
- JSON
more/1.3.0.1:
- String.QueryString
- Fx.Scroll

provides:
- HashNav
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	var instance = null, history = [], observers = {}, version = 0.86, // Singleton
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
			cookieOptions: { domain: false, path: '/', duration: 365, secure: false },
			ignoreVersionCheck: false
		},
		
		state: { polling: false, native: false, current: '', storedHash: ['', { page: '', pathString: '', pathParsed: null }] },
		
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
							if(entry == 'all') return history;
							
							entry = parseInt(entry),
							negen = history.length + entry;
							
							if(entry >= 0) return history[entry];
							else if(negen < history.length && negen >= 0) return history[negen];
							return false;
						},
						
						clear: function(){ history = []; }
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
					this.state.native = true;
					window.onhashchange = this.poll.bind(this); /* prevents our this.* references below from gettting lost :D */
					this.poll();
				}
				
				else this.startPolling();
				instance = this;
			}
		},
		
		startPolling: function()
		{
			if(this.state.native) return false;
			else
			{
				this.poll();
				this.state['polling'] = setInterval(this.poll.bind(this), this.options.interval);
				return true;
			}
		},
		
		stopPolling: function()
		{
			if(this.state['polling'])
			{
				clearInterval(this.state['polling']);
				this.state['polling'] = false;
				return true;
			}
			
			return false;
		},
		
		poll: function()
		{
			var lhsplit, lochash = window.location.hash;
			if(this.state['storedHash'][0] != lochash)
			{
				this.state['storedHash'][0] = (lochash.length ? lochash : '#');
				
				if(this.isLegalHash())
				{
					lhsplit = lochash.split('&&');
					this.state['storedHash'][1]['page'] = lhsplit.shift().substr(this.options.prefix.length+1).clean() || this.state.current || this.options.defaultHome;
					this.state.current = this.state['storedHash'][1]['page'];
					this.state['storedHash'][1]['pathString'] = lhsplit.join('&&');
				
					if(this.options.cleanQueryString) this.state['storedHash'][1]['pathParsed'] = this.state['storedHash'][1]['pathString'].cleanQueryString();
					else this.state['storedHash'][1]['pathParsed'] = utility.PQS(this.state['storedHash'][1]['pathString'], this.options.queryMakeFalse);
				
					if(this.options.trackHistory) history.push(this.getStoredHashData().clone());
				}
				
				else
				{
					this.state['storedHash'][1]['page'] = '';
					this.state['storedHash'][1]['pathString'] = '';
					this.state['storedHash'][1]['pathParsed'] = null;
				}
				
				this.triggerEvent();
			}
		},
		
		registerObserver: function(name, trigger, fn, args, bind, scrlto)
		{
			if(!observers[name]) observers[name] = [];
			observers[name].push(function(e)
			{
				e = e[1];
				if(!e) return;
				var hist = this.history.get(-2), hist = this.options.trackHistory ? (hist ? hist : -1) : -1, path = e.pathParsed, satisfied = false, strict = false, wildstrict = false;
				
				if(trigger.qualifiers)
				{
					if(trigger.qualifiers.strict) strict = true;
					if(trigger.qualifiers.wildstrict) wildstrict = true;
				}
				
				// Trigger logic
				if(trigger.page === false ||
				(trigger.page 	=== true 	&& (hist != -1 && hist[1].page && e.page != hist[1].page)) ||
				(trigger.page 	=== '' 		&& e.page == this.options.defaultHome) ||
				trigger.page	==  e.page)
				{
					if(trigger.page === false) satisfied = true; // We don't negotiate with terrorists (or illegal hash URIs)!
					hist = Object.every(trigger.params, function(item, index)
					{
						if(satisfied) return true;
						else if(index === '*')
						{
							if(item === '~' && (!path || Object.getLength(path) == 0)) return satisfied = true;
							else if(Object.getLength(path))
							{
								if(item === '' && Object.getLength(path)) return satisfied = true;
								else
								{
									var temp = trigger.params['*'];
									delete trigger.params['*'];
									
									if((item === true  && Object.contains(path, true)) ||
									 (item === false && Object.contains(path, (this.options.makeFalse ? false : ''))) ||
									 (Object.values(path).every(function(value){ return (wildstrict ? value === item : value.toString() == item.toString()); })))
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
						if(trigger.qualifiers)
						{
							if(trigger.qualifiers.exclusive && Object.getLength(trigger.params) !== Object.getLength(path)) return;
							// More coming soon
						}
						
						if(scrlto) HashNav.scrlTo(scrlto);
						fn.apply(bind, [this.getStoredHashData()].append(Array.from(args)));
					}
				}
			}.bind(this));
			
			window.addEvent('navchange', observers[name].getLast());
		},
		
		registeredObserver: function(name){ return typeof(observers[name]) != 'undefined'; },
		
		unregisterObserver: function(name)
		{
			if(typeof(observers[name]) != 'undefined')
			{
				observers[name].each(function(item){ window.removeEvent('navchange', item); });
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
			
			else if(typeof(loc) == 'object') wlh = this.options.prefix + '&&' + utility.POTQS(loc);
			
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
		
		getStoredHash: function(){ return this.state.storedHash[1]['pathParsed'] = this.state.storedHash[1]['pathParsed'] || {}; },
		getStoredHashData: function(){ return this.state.storedHash; },
		
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
			if(arguments[0] == 'all') Object.each(this.getStoredHash(), function(item, key){ delete this.state.storedHash[1].pathParsed[key]; }, this);
			else Object.each(arguments, function(item){ delete this.state.storedHash[1].pathParsed[item]; }, this);
			this.navigateTo(this.getStoredHash());
		},
		
		has: function()
		{
			if(arguments[0] == 'all') return !!Object.getLength(this.getStoredHash());
			var result = Object.filter(arguments, function(item){ return item in this.getStoredHash(); }.bind(this));
			return  Object.getLength(arguments) == 1 ? (Object.getLength(result) == 1 ? true : false) : Object.values(result);
		},
		
		isLegalHash: function(hash)
		{
			hash = hash || this.getStoredHashData()[0];
			return hash.substr(1, this.options.prefix.length) == this.options.prefix;
		},
		
		serialize: function(cookieName)
		{
			Cookie.write((cookieName || this.options.externalConstants[1])+'_version', escape(version), this.options.cookieOptions);
			Cookie.write((cookieName || this.options.externalConstants[1])+'_options', JSON.encode(this.options), this.options.cookieOptions);
			Cookie.write((cookieName || this.options.externalConstants[1])+'_state', JSON.encode(this.state), this.options.cookieOptions);
			Cookie.write((cookieName || this.options.externalConstants[1])+'_history', JSON.encode(history), this.options.cookieOptions);
		},
		
		unserialize: function(restoreParadigm, fireEventOnNav, cookieName)
		{
			if(restoreParadigm !== false) restoreParadigm = true;
			if(fireEventOnNav !== false) fireEventOnNav = true;
			
			var tempdata = {};
			tempdata['version'] = unescape(Cookie.read((cookieName || this.options.externalConstants[1])+'_version'));
			tempdata['options'] = 	JSON.decode(Cookie.read((cookieName || this.options.externalConstants[1])+'_options'), true);
			tempdata['state'] = 	JSON.decode(Cookie.read((cookieName || this.options.externalConstants[1])+'_state'), true);
			tempdata['history'] = 	JSON.decode(Cookie.read((cookieName || this.options.externalConstants[1])+'_history'), true);
			
			if(restoreParadigm)
			{
				if(Object.every(tempdata, function(item){ return !!item; }) && version.toString() == tempdata['version'])
				{
					version = tempdata['version'];
					this.setOptions(tempdata['options']);
					this.state = tempdata['state'];
					history = tempdata['history'];
					return this.navigateTo(-1, fireEventOnNav);
					return true;
				}
			
				return false;
			}
			
			else return tempdata;
		},
		
		deserialize: function(cookieName, cookieOptions)
		{
			Cookie.dispose((cookieName || this.options.externalConstants[1])+'_version', cookieOptions || this.options.cookieOptions);
			Cookie.dispose((cookieName || this.options.externalConstants[1])+'_options', cookieOptions || this.options.cookieOptions);
			Cookie.dispose((cookieName || this.options.externalConstants[1])+'_state', cookieOptions || this.options.cookieOptions);
			Cookie.dispose((cookieName || this.options.externalConstants[1])+'_history', cookieOptions || this.options.cookieOptions);
		},
		
		triggerEvent: function(){ window.fireEvent('navchange', [this.getStoredHashData()]); }
		
	});
})();

HashNav.extend({
	
	scrl: new Fx.Scroll(window),
	scrlTo: function(elID)
	{
		elID = typeof(elID) == 'string' ? document.id(elID) : elID;
		if(elID) HashNav.scrl.toElement(elID);
	}
	
});