/*
---
description: An AJAX-esque hash navigation class made in JavaScript using MooTools 1.3+

license: MIT-style license

authors:
- Xunnamius

requires:
- core/1.3+: [Class.Extras, Element.Event]
- provided: [String.QueryStringImproved]

provides: [HashNav]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function($)
{
	var instance = null, observers = {}, version = 1.4, navigateTo = true, // Singleton
	state = { polling: false, 'native': false, current: '', storedHash: ['', { page: '', pathString: '', pathParsed: null }] };
	
	/* Check the documentation for information on HashNav's public methods and options! */
	this.HashNav = new Class({
		
		Implements: [Options, Events],
		
		options:
		{
			interval: 200,
			prefix: '!/',
			defaultHome: 'home',
			queryMakeFalse: false,
			externalConstants: ['NAVOBJOBSDATA', 'NAVOBJSERDATA'],
			
			// Leave encoding off, HashNav uses its own internal encoding instead
			cookieOptions: { path: '/', domain: false, duration: 365, secure: false, document: document, encode: false },
			cookieDataHardLimits: [2000, 6],
			
			ignoreVersionCheck: false,
			parser: null
		},
		
		initialize: function(options)
		{
			if(!instance)
			{
				this.setOptions(options);
				
				// If one plans on dynamically shifting parsers during run-time,
				//  be sure to call setInstance on the parser classes!
				if(!this.options.parser)
					this.options.parser = new HashNav.parsers.slash();
				this.options.parser.setInstance(this);
				
				// Does this browser have support for the hashchange event?
				if(!Browser.ie7 && 'onhashchange' in window)
				{
					state['native'] = true;
					window.onhashchange = this.poll.bind(this);
					this.poll();
				}
				
				else this.startPolling();
				instance = this;
			}
			
			return instance;
		},
		
		startPolling: function()
		{
			if(this.isNative()) return false;
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
			var lochash = window.location.hash;
			
			if(this.getStoredHashData()[0] != lochash)
			{
				state['storedHash'][0] = (lochash.length ? lochash : '#');
				
				if(this.isLegalHash())
				{
					// Just in case the prefix occurs other places in the string
					var parsed = lochash.split(this.options.prefix);
					parsed.shift();
					parsed = this.options.parser.parse(parsed.join(this.options.prefix));
					
					state.current = state['storedHash'][1]['page'] = parsed.page.clean() || this.getCurrent() || this.options.defaultHome;
					state['storedHash'][1]['pathString'] = parsed.pathString;
					state['storedHash'][1]['pathParsed'] = parsed.pathParsed;
					
					// History optimization using a pointer system
					if(this.$_hidden_history_loaded) this.push(this.getStoredHashData().clone());
				}
				
				else
				{
					state.current = state['storedHash'][1]['page'] = '';
					state['storedHash'][1]['pathString'] = '';
					state['storedHash'][1]['pathParsed'] = null;
				}
				
				this.triggerEvent();
			}
		},
		
		registerObserver: function(name, trigger, fn, args, bind, scrlto)
		{
			/* Trigger optimization logic */
			if(!trigger.params) trigger.params = {};
			if(!bind) bind = this;
			if(!trigger || typeof(trigger.page) == 'undefined') return false;
			else
			{
				/* Check documentation on the specifics of what's going on within each protected method */
				if(!this.$_hidden_wlogic_loaded && trigger.params && typeof(trigger.params['*']) != 'undefined') delete trigger.params['*'];
				if(trigger.qualifiers && this.$_hidden_qlogic_loaded) trigger = this.$_hidden_qlogic_optimize(trigger);
				else if(trigger.qualifiers) delete trigger.qualifiers;
				if(typeof(trigger.params['*']) != 'undefined' && this.$_hidden_wlogic_loaded) trigger = this.$_hidden_wlogic_optimize(trigger);
			}
			
			if(!observers[name]) observers[name] = [];
			observers[name].push([function(e)
			{
				e = e[1];
				if(!e) return;
				
				/*
				 * If $_hidden_history_loaded is null/false (or if history.get(-1) is null by the end), returns -1.
				 * Otherwise returns this.history.get(-2) if it is not null, otherwise returns -2.
				 * This makes it so "page change only" triggers trigger only if the current hash
				 * URI is legal and different from this.history.get(-2).
				*/
				var hist = -1;
				if(this.$_hidden_history_loaded)
				{
					hist = this.history.get(-2);
					
					if(!hist)
					{
						if(this.history.get(-1)) hist = -2;
						else hist = -1;
					}
				}
				
				var map = { path: e.pathParsed, satisfied: false, strict: false, wildstrict: false };
				
				/* Opening qualifier logic */
				if(trigger.qualifiers && this.$_hidden_qlogic_loaded)
				{
					var scan = this.$_hidden_qlogic_openScan(trigger, map);
					trigger = scan[0];
					map = scan[1];
					if(scan[2]) return;
				}
				
				// Main Trigger logic
				if(trigger.page === false || this.isLegalHash() &&
				((trigger.page 	=== true  && (hist == -2 || (hist != -1 && hist[1].page && e.page && e.page != hist[1].page))) ||
				(trigger.page 	=== '' 	  && e.page == this.options.defaultHome) ||
				trigger.page	==  e.page))
				{
					if(trigger.page === false && !this.isLegalHash()) map.satisfied = true; // We don't negotiate with terrorists (or illegal hash URIs).
					hist = Object.every(trigger.params, function(item, index) // The 'hist' variable is being recycled here
					{
						if(map.satisfied) return true;
						else if(index === '*')
						{
							var scan = this.$_hidden_wlogic_scan(trigger, map);
							trigger = scan[0];
							map = scan[1];
							return scan[2];
						}
						
						else
						{
							 if(item === '~' && (!map.path || typeof(map.path[index]) == 'undefined')) return true;
							 else if(Object.getLength(map.path))
							 {
								 if(
								  (item === true  && map.path[index] === true) ||
								  (item === false && (map.path[index] === '' || (this.options.makeFalse && map.path[index] === false))) ||
								  (item === '' 	  && typeof(map.path[index]) != 'undefined') ||
								  (map.path[index] 	  && (map.strict ? item === map.path : item.toString() == map.path[index].toString())))
									return true;
							 }
							 
							return false;
						}
					}.bind(this));
					
					if(hist)
					{
						// Last-possible-second qualifier logic
						if(trigger.qualifiers && this.$_hidden_qlogic_loaded)
						{
							scan = this.$_hidden_qlogic_closeScan(trigger, map);
							trigger = scan[0];
							map = scan[1];
							if(scan[2]) return;
						}
						
						if(this.$_hidden_fx_loaded && scrlto) this.Fx.scrlTo(scrlto);
						fn.apply(bind, [this.getStoredHashData()].append(Array.from(args)));
					}
				}
			}.bind(this), trigger, args, bind, scrlto]);
			
			if(this.$_hidden_unregisterObservers_loaded) this.updateRemote(Object.keys(observers));
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
				if(this.$_hidden_unregisterObservers_loaded) this.updateRemote(Object.keys(observers));
				return true;
			}
			
			return false;
		},
		
		navigateTo: function(loc)
		{
			var wlh = window.location.hash,
				triggerEvent = false,
				arguments = Array.from(arguments);
			
			// Polymorphism at work!
			if(typeof(arguments[arguments.length-1]) == 'boolean')
			{
				triggerEvent = arguments[--arguments.length];
				delete arguments[arguments.length];
			}
			
			// Page+params (mode 2)
			if(typeof(arguments[0]) == 'string' && arguments[1] && typeof(arguments[2]) == 'undefined')
			{ wlh = this.options.parser.createURIMode2(Array.from(arguments)); }
			
			// Prefix+page+params (mode 3)
			else if(typeof(arguments[0]) == 'string' && typeof(arguments[1]) == 'string' && typeof(arguments[2]) != 'undefined')
			{ wlh = this.options.parser.createURIMode3(Array.from(arguments)); }
			
			// History (mode 1)
			else if(typeof(loc) == 'number' && this.$_hidden_history_loaded && navigateTo)
			{ wlh = this.options.parser.createURIMode1History(loc); }
			
			// Params (mode 1)
			else if(typeof(loc) == 'object')
			{ wlh = this.options.parser.createURIMode1Object(loc); }
			
			// URI (mode 1)
			else if(typeof(loc) == 'string')
			{ wlh = this.options.parser.createURIMode1String(loc); }
			
			// Unknown
			else return false;
			if(wlh === false) return navigateTo ? false : null;
			
			if(navigateTo)
			{
				window.location.hash = wlh;
				if(triggerEvent) this.triggerEvent();
				else this.poll();
				return true;
			}
			
			else return '#'+wlh;
		},
		
		buildURI: function()
		{
			navigateTo = false;
			var result = this.navigateTo.apply(this, Array.from(arguments));
			navigateTo = true;
			return result;
		},
		
		getCurrent: function(){ return state.current; },
		getStoredHash: function(){ return state.storedHash[1]['pathParsed'] || {}; },
		getStoredHashData: function(){ return state.storedHash; },
		
		get: function()
		{
			if(arguments[0] == 'all' || !arguments.length) return this.getStoredHash();
			var result = {}, get = this.getStoredHash();
			Object.each(arguments, function(item){ if(item in get) result[item] = get[item]; }, this);
			return Object.getLength(result) ?
				(arguments.length == 1 ? result[arguments[0]] : result) :
				(arguments.length == 1 ? null : {});
		},
		
		set: function()
		{
			var data = {};
			
			if(typeof(arguments[0]) == 'object') // 1.4
				data = arguments[0];
			else if(arguments.length > 1)
				data[arguments[0]] = arguments[1];
			
			Object.merge(this.getStoredHash(), data);
			this.navigateTo(this.getStoredHash());
		},
		
		unset: function()
		{
			if(arguments[0] == 'all') Object.each(this.getStoredHash(), function(){ delete state.storedHash[1].pathParsed[arguments[1]]; }, this);
			else Object.each(arguments, function(item){ delete state.storedHash[1].pathParsed[item]; }, this);
			this.navigateTo(this.getStoredHash());
		},
		
		has: function()
		{
			if(arguments[0] == 'all') return !!Object.getLength(this.getStoredHash());
			var result = Object.filter(arguments, function(item){ return item in this.getStoredHash(); }.bind(this));
			return  Object.getLength(arguments) == 1 ?
				(Object.getLength(result) == 1 ? true : false) :
				(Object.values(result));
		},
		
		isNative: function(){ return state['native']; },
		isLegalHash: function(hash)
		{
			hash = hash || this.getStoredHashData()[0];
			return hash.substr(1, this.options.prefix.length) == this.options.prefix;
		},
		
		triggerEvent: function(customHashData)
		{
			var hashData = this.getStoredHashData(),
				hashData = (customHashData ? customHashData : (hashData ? hashData : false));
			return (hashData[0] ? !!window.fireEvent('navchange', [this.getStoredHashData()]) : false);
		},
		
		toString: function()
		{
			return this.getStoredHashData()[0];
		},
		
		$_hidden_pseudoprivate_getState: function()
		{
			return [state, version];
		}.protect(),
		
		$_hidden_pseudoprivate_setState: function(stateobj, ver)
		{
			state = stateobj;
			version = ver;
		}.protect()
	});
	
	var GeneralHashURIParser = new Class({
		parsed: null,
		pagestr: null,
		pathstr: null,
		pathparse: null,
		instance: null,
		separators: { main: null, pair: null, field: null },
		
		initialize: function()
		{ throw "TypeError: Class 'GeneralHashURIParser' is abstract and should not be instantiated directly."; },
			
		setInstance: function(instance)
		{ this.instance = instance; },
		
		parse: function(uri)
		{ throw "TypeError: Object '"+this+"' has no proper method 'parse'"; },
		
		createURIMode1History: function(data)
		{
			var hist = (this.instance.history.get(data) || [null])[0];
			if(hist) return hist;
			else return false; // Bad params
		},
		
		createURIMode1Object: function(data)
		{
			return this.instance.options.prefix +
				   this.instance.getCurrent() +
				   this.separators.main +
				   this.parseObjectToQueryString(data);
		},
		
		createURIMode1String: function(data)
		{ return data; },
		
		createURIMode2: function(data)
		{
			return this.instance.options.prefix +
				   data[0] + this.separators.main +
				   (typeof(data[1]) == 'object' ?
				   		this.parseObjectToQueryString(data[1]) :
						data[1]);
		},
		
		createURIMode3: function(data)
		{
			return data[0] +
				   data[1] +
				   this.separators.main +
				   (typeof(data[2]) == 'object' ?
				   		this.parseObjectToQueryString(data[2]) :
						data[2]);
		},
		
		parseObjectToQueryString: function(obj)
		{ throw "TypeError: Object '"+this+"' has no proper method 'parseObjectToQueryString'"; }
	});
	
	this.HashNav.parsers = { GeneralHashURIParser: GeneralHashURIParser };
	
	this.HashNav.parsers.slash = new Class({
		Extends: HashNav.parsers.GeneralHashURIParser,
		
		initialize: function(separator)
		{
			var sep = (separator || '/').toString();
			this.separators = { main: sep, pair: sep, field: sep };
		},
		
		parse: function(uri)
		{
			this.parsed = uri.split(this.separators.main);
			this.pagestr = this.parsed.shift();
			this.pathstr = this.parsed.join(this.separators.main);
			this.pathparse = {};
			
			while(this.parsed.length)
			{
				var key = this.parsed.shift(),
					item = this.parsed.shift() || '';
				
				if(item === 'true')
					item = true;
				else if(item === 'false' || (item === '' && this.instance.options.queryMakeFalse))
					item = false;
				
				this.pathparse[key] = (item);
			}
			
			return { page: this.pagestr, pathString: this.pathstr, pathParsed: this.pathparse };
		},
		
		createURIMode1String: function(data)
		{
			if(data.charAt(0) == '#') return data;
			
			// Keeping with linux-style absolube vs. relative URI notation
			else if(data.charAt(0) == this.separators.main) return this.instance.options.prefix + data.substr(1);
			else return this.instance.options.prefix + this.instance.getCurrent() + this.separators.main + data;
		},
		
		parseObjectToQueryString: function(obj)
		{
			Object.each(obj, function(item, index)
			{
				if(typeof(item) == 'object')
					obj[index] = item.toString();
			});
			
			return Object.toQueryString(obj).replace(/=|&/gi, this.separators.main);
		}
	});
})(document.id);