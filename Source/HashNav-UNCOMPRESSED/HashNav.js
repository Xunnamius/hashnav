/*
---
description: An AJAX-esque hash navigation class made in JavaScript using MooTools 1.3

license: MIT-style license

authors:
- Xunnamius

requires:
- core/1.3: [Class.Extras, Element.Event]
- provided: [String.QueryStringImproved]

provides: [HashNav]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	var instance = null, observers = {}, version = 1.0, // Singleton
	state = { polling: false, native: false, current: '', storedHash: ['', { page: '', pathString: '', pathParsed: null }] };
	
	/* Check the documentation for information on HashNav's public methods and options! */
	this.HashNav = new Class({
		
		Implements: [Options, Events],
		
		options:
		{
			interval: 200,
			prefix: '!/',
			defaultHome: 'home',
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
				
				// Does this browser have support for the hashchange event?
				if(!Browser.ie7 && 'onhashchange' in window)
				{
					state.native = true;
					window.onhashchange = this.poll.bind(this);
					this.poll();
				}
				
				else this.startPolling();
				instance = this;
			}
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
			var lhsplit, lochash = window.location.hash;
			
			if(lochash && this.getStoredHashData()[0] != lochash)
			{
				state['storedHash'][0] = (lochash.length ? lochash : '#');
				
				if(this.isLegalHash())
				{
					lhsplit = lochash.split('&&');
					state['storedHash'][1]['page'] = lhsplit.shift().substr(this.options.prefix.length+1).clean() || this.getCurrent() || this.options.defaultHome;
					state.current = state['storedHash'][1]['page'];
					state['storedHash'][1]['pathString'] = lhsplit.join('&&');
				
					if(this.options.cleanQueryString) state['storedHash'][1]['pathParsed'] = state['storedHash'][1]['pathString'].cleanQueryString();
					else state['storedHash'][1]['pathParsed'] = state['storedHash'][1]['pathString'].parseQueryStringImproved(this.options.queryMakeFalse);
					
					// History optimization using a pointer system
					if(this.$_hidden_history_loaded) this.push(this.getStoredHashData().clone());
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
			/* Trigger optimization logic */
			if(!trigger.params) trigger.params = {};
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
				if(trigger.page === false ||
				(trigger.page 	=== true  && (hist == -2 || (hist != -1 && hist[1].page && e.page && e.page != hist[1].page))) ||
				(trigger.page 	=== '' 	  && e.page == this.options.defaultHome) ||
				trigger.page	==  e.page)
				{
					if(trigger.page === false) map.satisfied = true; // We don't negotiate with terrorists (or illegal hash URIs).
					hist = Object.every(trigger.params, function(item, index) //the 'hist' namespace is being reused here
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
							var scan = this.$_hidden_qlogic_closeScan(trigger, map);
							trigger = scan[0];
							map = scan[1];
							if(scan[2]) return;
						}
						
						if(this.$_hidden_fx_loaded && scrlto) this.Fx.scrlTo(scrlto);
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
		
		navigateTo: function(loc)
		{
			var wlh = window.location.hash, triggerEvent = false;
			
			// Polymorphism at work!
			if(typeof(arguments[arguments.length-1]) == 'boolean')
			{
				triggerEvent = arguments[--arguments.length];
				delete arguments[arguments.length];
			}
			
			if(typeof(arguments[0]) == 'string' && arguments[1] && !arguments[2]) wlh = this.options.prefix + arguments[0] + '&&' + (typeof(arguments[1]) == 'object' ? Object.parseObjectToQueryString(arguments[1]) : arguments[1]);
			else if(typeof(arguments[0]) == 'string' && typeof(arguments[1]) == 'string' && arguments[2]) wlh = arguments[0] + arguments[1] + '&&' + (typeof(arguments[2]) == 'object' ? Object.parseObjectToQueryString(arguments[2]) : arguments[2]);
			
			else if(typeof(loc) == 'number' && this.$_hidden_history_loaded)
			{
				var hist = (this.history.get(loc) || [null])[0];
				if(hist) wlh = hist;
				else return false;
			}
			
			else if(typeof(loc) == 'object') wlh = this.options.prefix + this.getCurrent() + '&&' + Object.parseObjectToQueryString(loc);
			
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
		getStoredHash: function(){ return state.storedHash[1]['pathParsed'] || {}; },
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
		
		triggerEvent: function(){ return (this.getStoredHashData()[0] ? window.fireEvent('navchange', [this.getStoredHashData()]) : false); }
		
	});
})();