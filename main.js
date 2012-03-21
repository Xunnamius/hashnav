var HASHNAV_LOCATION = 'HashNav',
	warningPopup = alert,
	hashNav = new HashNav(),
	load = {a:{custom:{page:function(f){console.log('loading a custom page of type "'+f+'"');}}},ajax:{data:function(){ console.log('loading ajax data...')}}},
	store = {that:{data:function(f){console.log('Stored.\n', f);}}};
	

// A fix for 1.3.2's Object.getFromPath() that I cooked up in a few seconds
Object.extend({
	
	getFromPath: function(obj, path)
	{
		path=path?path.split('.'):'';
		for(var i=0,j=path.length;i<j;++i) obj=obj?obj[path[i]]:null;
		return obj;
	},
	
	compare: function(a, b, strict)
	{
		if(!a || !b || Object.getLength(a) != Object.getLength(b)) return false;
		return Object.every(a, function(value, key){ return typeof(value) == 'object' ? Object.compare(value, b[key], strict) : (strict ? b[key] === value : b[key] == value); }, this);
	}
	
});

(function()
{
	var loaded = []; // Private variable ;)
	
	this.HNMODS =
	{
		load:
		{
			module: function(script, fn)
			{
				if(loaded.contains(script)) return console.error('Page: Load failed. Module '+(script=='all'?'(all of them)':script)+' has already been loaded!');
				
				loaded.push(script);
				if(script == 'all') $$('#modules ul li a').each(function(item){ HNMODS.load.module(item.getProperty('title')); }); // Another instance where recursion beats iteration
				else
				{
					Asset.javascript((location.protocol == 'file:' ? 'E:\\Shell Folders\\.gitrepos\\HashNav\\'+HASHNAV_LOCATION+'\\' : HASHNAV_LOCATION+'/') + script + '.js',
					{
						id: script,
						onLoad: function()
						{
							this.store('disabled', true).getParent().addClass('disabled').highlight();
							$$('li[rel="'+script+'"]').removeClass('disabled').highlight();
							this.set('html', 'Module <span class="special">'+script+'</span> was loaded successfully!').erase('title');
							if(fn != undefined) fn();
						}.bind($$('div#modules ul li a[title="'+script+'"]'))
					});
					
					console.info('Page: Loaded module '+script+'!');
				}
			}
		},
		
		unload:
		{
			module: function(script)
			{
				$(script).dispose();
				console.info('Page: Disposed of module '+script+'!');
				loaded.erase(script);
			}
		}
	};
})();

	// HashNav_T-QualifierLogic.js 1.0
var $_hidden_qlogic_optimize = function(trigger)
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
		
		if(trigger.qualifiers.exclusive)
		{
			if(Object.every(trigger.params, function(item){ return item === '~'; }))
			{
				var x = false;
				trigger.params = { '*':'~' };
				
				if(trigger.qualifiers)
				{
					if(trigger.qualifiers.explicitChange) trigger.qualifiers = { explicitChange: true };
					else delete trigger.qualifiers;
				}
			}
			
			else Object.each(trigger.params, function(item, key)
			{
				if(item == '~' && key != '*') delete trigger.params[key];
			});
		}
		
		if(trigger.qualifiers && !Object.getLength(trigger.qualifiers)) delete trigger.qualifiers;
		
		return trigger;
	},
	
	$_hidden_qlogic_openScan = function(trigger, map)
	{
		var returnval = false;
		
		if(trigger.qualifiers)
		{
			if(trigger.qualifiers.strict) map.strict = true;
			if(trigger.qualifiers.wildstrict) map.wildstrict = true;
			if(trigger.qualifiers.maxparams < Object.getLength(map.path) || trigger.qualifiers.minparams > Object.getLength(map.path))
				returnval = true;
		}
		
		return [trigger, map, returnval];
	},
	
	$_hidden_qlogic_closeScan = function(trigger, map)
	{
		var returnval = false;
		
		if(trigger.qualifiers.exclusive)
		{
			var params = Object.clone(trigger.params);
			params = Object.filter(params, function(value, key){ return value != '~'; });
			if(Object.getLength(params) !== Object.getLength(map.path)) returnval = true;
		}
		
		if(!returnval && trigger.qualifiers.explicitChange)
		{
			var h1 = this.history.get(-1)[1], h2 = this.history.get(-2)[1];
			returnval = Object.compare(h1?h1.pathParsed:null, h2?h2.pathParsed:null);
		}
		
		// More coming soon
		
		return [trigger, map, returnval];
	},
	
	// HashNav_T-WildcardLogic.js 1.0
	$_hidden_wlogic_optimize = function(trigger)
	{
		var value = trigger.params['*'];
		if(typeof(value) == 'boolean')
		{
			delete trigger.params['*'];
			if(!Object.contains(trigger.params, value)) trigger.params['*'] = value;
		}
		
		else if(value === '~')
		{
			var x = false;
			trigger.params = { '*':'~' };
			
			if(trigger.qualifiers)
			{
				if(trigger.qualifiers.explicitChange) trigger.qualifiers = { explicitChange: true };
				else delete trigger.qualifiers;
			}
		}
		
		else if(value === '')
		{
			if(Object.getLength(Object.filter(trigger.params, function(item){ return item !== '~'; }))-1) delete trigger.params['*'];
		}
		
		else
		{
			if(trigger.qualifiers && trigger.qualifiers.exclusive) delete trigger.qualifiers.exclusive;
			trigger.params = { '*':value };
		}
		
		return trigger;
	},
	
	$_hidden_wlogic_scan = function(trigger, map)
	{
		var returnval = false, item = trigger.params['*'];
		
		if(item === '~')
		{
			if(!map.path || Object.getLength(map.path) == 0)
				returnval = map.satisfied = true;
		}
		
		else if(Object.getLength(map.path))
		{
			delete trigger.params['*'];
			
			if(item === '')
			{
				// Ninja Art: Empty Wildcard Parameter Plus Exclusive Qualifier Jutsu!
				if(trigger.qualifiers && trigger.qualifiers.exclusive && Object.getLength(map.path) != Object.getLength(Object.filter(trigger.params, function(item){ return item != '~'; })))
					returnval = false;
				else returnval = map.satisfied = true;
			}
			
			else
			{
				if((item === true  && Object.contains(map.path, true)) ||
				   (item === false && Object.contains(map.path, (this.options.makeFalse ? false : ''))) ||
				   (Object.values(map.path).every(function(value){ returnval = (map.wildstrict ? value === item : value.toString() == item.toString()); })))
					 returnval = true;
			}
			
			trigger.params['*'] = item;
		}
		
		return [trigger, map, returnval];
	},
	
	// Trigger logic from HashNav.js version 1.0 - some instances of "this" have been replaced
	matches = function(e, trigger)
	{
		// Necessary. Do not erase!
		if(!this.isLegalHash()) this.navigateTo('home');
		if(!trigger.params) trigger.params = {};
		
		/* Begin! */
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
			var scan = $_hidden_qlogic_openScan(trigger, map);
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
			hist = Object.every(trigger.params, function(item, index) // The 'hist' namespace is being reused here
			{
				if(map.satisfied) return true;
				else if(index === '*')
				{
					var scan = $_hidden_wlogic_scan(trigger, map);
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
					var scan = $_hidden_qlogic_closeScan(trigger, map);
					trigger = scan[0];
					map = scan[1];
					if(scan[2]) return;
				}
				
				return true;
			}
			
			return false;
		}
	};

// HashNav Optimize Wrapper - for this script only
var $optimize = function(trigger)
{
	// Necessary. Do not erase!
	if(!trigger.params) trigger.params = {};
	
	/* Begin! */
	if(!this.$_hidden_wlogic_loaded && typeof(trigger.params['*']) != 'undefined') delete trigger.params['*'];
	if(trigger.qualifiers && this.$_hidden_qlogic_loaded) trigger = $_hidden_qlogic_optimize(trigger);
	else if(trigger.qualifiers) delete trigger.qualifiers;
	if(typeof(trigger.params['*']) != 'undefined' && this.$_hidden_wlogic_loaded) trigger = $_hidden_wlogic_optimize(trigger);
	return trigger;
}

window.addEvent('domready', function()
{
	if(typeof(console) == 'undefined')
	{
		$$('body').setStyle('opacity', '.05');
		alert("This browser either does not have a suitable JavaScript console or it has been disabled. Please enable it and refresh the page.");
	}
	
	else
	{
		console.group = console.group || Function.from();
		console.groupCollapsed = console.groupCollapsed || Function.from();
		console.groupEnd = console.groupEnd || Function.from();
		
		console.group('HashNav Initialization');
		console.log('Page: Initializing HashNav class...');
		
		var hashNav = new HashNav(), change = 0;
		console.log('HashNav: Hello World!');
		
		console.groupCollapsed('Verbose Setup Debug');
		console.log('Page: Binding internal $ functions...');
		$optimize = $optimize.bind(hashNav);
		$_hidden_qlogic_optimize = $_hidden_qlogic_optimize.bind(hashNav);
		$_hidden_qlogic_openScan = $_hidden_qlogic_openScan.bind(hashNav);
		$_hidden_qlogic_closeScan = $_hidden_qlogic_closeScan.bind(hashNav);
		$_hidden_wlogic_optimize = $_hidden_wlogic_optimize.bind(hashNav);
		$_hidden_wlogic_scan = $_hidden_wlogic_scan.bind(hashNav);
		
		var clbk = function()
		{
			var callback = function(e)
			{
				$('current-hash').set('text', e[0] || '(blank)');
				$('previous-hash').set('text', (hashNav.history ? hashNav.history.get(-2)[0] : '(HashNav.History module has NOT been loaded yet)') || '(blank)');
				$('hash-prefix').set('text', hashNav.options.prefix);
				$('hash-page').set('text', e[1].page || '(blank)');
				$('hash-path').set('text', e[1].pathString || '(blank)');
				$('hash-legal').set('text', hashNav.isLegalHash() ? 'Legal' : 'Illegal').setStyle('color', (hashNav.isLegalHash() ? 'green' : 'red'));
				console.log('DOM Element: Hash URI change observed! Resulting hash URI: (change #'+(++change)+') ', e.clone());
			};
			
			if(hashNav.$_hidden_DOM_loaded)
			{
				console.log('HashNav: Setting up initial observers...');
				$('current-hash').observe({ page: false }, function(e){ callback(e) });
			}
			
			else
			{
				console.warn('HashNav Class: The HashNav.DOM module has NOT been loaded yet! You can load it manually by typing "HNMODS.load.module(\'HashNav.DOM\');" into this console, or you can have it autoloaded (and have it\'s code example activated) by adding "?autoloadDOM=1" to the end of this page\'s URL.');
				console.log('HashNav: Creating observer directly...');
				hashNav.registerObserver('main', { page: false }, function(e){ callback(e) });
			}
			
			console.log('Page: Initializing UnderText instances...');
			$$('input').each(function(item){ item.store('undertext', new UnderText(item, { catchSubmit: false })); });
			
			console.log('Page: Setting up setOptions() bridge...');
			$$('#test-setOptions a').addEvent('click', function(e)
			{
				e.stop();
				var undertext = $('test-setOptions-input').retrieve('undertext');
				if(undertext.get())
				{
					var json = JSON.decode.attempt(undertext.get());
					if(!json) console.error('Invalid JSON!');
					else
					{
						hashNav.setOptions(json);
						console.warn('HashNav: New Options Set! -> ', json);
						return;
					}
				}
				
				undertext.flash();
			});
			
			console.log('Page: Setting up remaining event handlers...');
			$$('.test').each(function(item)
			{
				var m, method = m = item.getParent('li').getProperty('id'), elementMethod = item.getParent('li').getProperty('class');
				method = method.substr(method.indexOf('-')+1);
				
				item.getChildren('a')[0].addEvent('click', function(e)
				{
					e.stop();
					var arguments = item.getChildren('input'), args = [];
					
					if(arguments.every(function(value)
					{
						value = value.retrieve('undertext');
						var data = value.get();
						
						if(data === '' && !value.toElement().hasClass('optional'))
						{
							value.flash();
							return false;
						}
						
						else if(data === '') data = null;
						
						if(typeof(data) == 'string' && data.substr(0, 5) == "args<")
						{
							args = data.substring(5, data.length-1).split(',');
							return true;
						}
						
						if(typeof(data) == 'string' && data.substr(0, 4) == "str<") data = "" + data.substring(4, data.length-1).toString();
						if(typeof(data) == 'string' && data.substr(0, 7) == "number<") data = Number.from(data.substring(7, data.length-1));
						if(typeof(data) == 'string' && data.substr(0, 8) == "boolean<") data = data.substring(8, data.length-1) == "true" ? true : false;
						else data = JSON.decode.attempt(data) || data;
						args.push(data);
						return true;
					}))
					{
						console.log('HashNav: Attempting to call ', method+'(', args, ') ...');
						
						var logic = (method.contains('.') ? Object.getFromPath(hashNav, method) : (elementMethod ? $('scrollto')[method] : hashNav[method]));
						
						if(logic)
						{
							logic = logic.apply((elementMethod ? $('scrollto') : hashNav), args);
							console.log('HashNav: Result -> ', typeof(logic) == 'undefined' ? '(method doesn\'t return a result)' : logic);
						}
						
						else console.warn('HashNav Class: The module that supports the method '+method+'() has NOT been loaded yet!');
						
					}
				});
			});
			
			$('test-Fx.scrl').getElements('a')[0].addEvent('click', function(e)
			{
				e.stop();
				console.log('HashNav: Attempting to interrogate the scrl property...');
				if(hashNav.Fx.scrl) console.log('HashNav: Result -> ', hashNav.Fx.scrl, ' (instance of Fx.Scroll)');
				else console.warn('HashNav Class: The HashNav.Fx module has NOT been loaded yet!');
			}.bind(this));
			
			$('test-Fx.scrlTo').getElements('a')[0].addEvent('click', function(e)
			{
				e.stop();
				
				var undertext = $('test-scrlTo-element').retrieve('undertext'), element = undertext.get();
				if(element)
				{
					console.log('HashNav: Attempting to call HashNav::scrlTo(', element, ') ...');
					if(!hashNav.Fx.scrl) return console.warn('HashNav Class: The HashNav.Fx module has NOT been loaded yet!');
					console.log('HashNav: Result -> (method doesn\'t return a result)');
					hashNav.Fx.scrlTo(element);
					
					if($('test-scrlTo-back').checked)
					{
						console.log('HashNav: Automatically scrolling back to the top in 5 seconds...');
						(function()
						{
							console.log('Page: Scrolling back!');
							hashNav.Fx.scrlTo('test-Fx.scrlTo');
						}).delay(5000);
					}
				}
				
				else undertext.flash();
			});
			
			console.log('Page: Setting up Trigger Demystifier...');
			$$('#test-trigger a')[0].addEvent('click', function(e)
			{
				e.stop();
				
				var trigger = $('test-trigger-object').retrieve('undertext').get(), trigger = JSON.decode.attempt(trigger) || trigger, results = $('test-trigger-result'), msg, opttrig;
				results.empty();
				
				if(!trigger || typeof(trigger.page) == 'undefined')
				{
					$('test-trigger-object').retrieve('undertext').flash();
					new Element('li', { text: '(empty)' }).inject(results);
					return;
				}
				
				else new Element('li', { text: '(loading...)' }).inject(results);
				if(!trigger.params) trigger.params = {};
				
				// Warning! >:O
				if((trigger.qualifiers && !hashNav.$_hidden_qlogic_loaded) || (trigger.params && typeof(trigger.params['*']) != 'undefined' && !hashNav.$_hidden_wlogic_loaded))
					console.warn('Page: Warning! One or more of the logical modules required to process parts of your trigger object are either incomplete or missing. Please make sure to import them for an accurate result.');
				
				opttrig = $optimize(Object.clone(trigger));
				if(opttrig.qualifiers && opttrig.qualifiers.explicitChange) delete opttrig.qualifiers.explicitChange; // explicitChange has no context here
				if(!Object.compare(trigger, opttrig))
				{
					results.getFirst('li').set('text', 'Your trigger was optimized!'+(trigger.qualifiers && trigger.qualifiers.explicitChange?' ("explicitChange" is meaningless within the context of this test and has therefore been removed)':''));
					new Element('li', { text: 'Old trigger: ' + JSON.encode(trigger) }).inject(results);
					new Element('li', { text: 'New trigger: ' + JSON.encode(opttrig) }).inject(results);
					trigger = opttrig;
					new Element('li', { text: 'Your trigger will activate when the following conditions are met...' }).inject(results);
				}
				
				else results.getFirst('li').set('text', 'Your trigger will activate when the following conditions are met...');
				
				// Trigger logic
				if(trigger.page === false) msg = 'The hash URI changes (even if the resulting hash is illegal)';
				else if(trigger.page === true) 	msg = 'The state designator changes (and the resulting hash is legal)';
				else if(trigger.page === '') 	msg = 'The state designator is the same as the defaultHome setting';
				else msg = 'The state designator == ' + trigger.page;
				new Element('li', { text: msg + (trigger.qualifiers && trigger.qualifiers.explicitChange ? ' and the hash data has actually changed in some significant way (ingored during trigger URI testing)' : '') }).inject(results);
				
				if(!Object.getLength(trigger.params)) new Element('li', { text: (trigger.qualifiers && trigger.qualifiers.exclusive ? 'The hash URI is not allowed to have any parameters!' : 'The hash URI may contain any number of parameters!') }).inject(results);
				else if(typeof(trigger.params['*']) != 'undefined' && trigger.params['*'] === '~') new Element('li', { text: 'Wildcard: The hash URI is not allowed to have any parameters!' }).inject(results);
				else 
				{
					if(typeof(trigger.params['*']) != 'undefined' && trigger.params['*'] !== '' && trigger.params['*'] !== true && trigger.params['*'] !== false)
						new Element('li', { text: 'Wildcard: All parameters must equal ' + trigger.params['*'] + ' (all other params are ignored)' }).inject(results);
					else Object.each(trigger.params, function(item, index)
					{
						if(index === '*')
						{
							if(item === '') msg = 'Wildcard: There must be at least one parameter present within the hash URI';
							else if(item === true) msg = 'Wildcard: There must be at least one orphan parameter present within the hash URI';
							else if(item === false) msg = 'Wildcard: There must be at least one empty parameter present within the hash URI';
						}
						
						else
						{
							 if(item === '~') msg = index + ' is NOT present within the hash URI';
							 else if(item === true ) msg = index + ' is present as an orphan parameter within the hash URI';
							 else if(item === false) msg = index + ' is present as an empty parameter within the hash URI';
							 else if(item === '') msg = index + ' is present (with any value) within the hash URI';
							 else msg = index + ' is present within the hash URI and equals "' + item+'"';
						}
						
						new Element('li', { text: msg }).inject(results);
					});
					
					if(trigger.qualifiers)
					{
						if(trigger.qualifiers.exclusive) new Element('li', { text: 'Due to the "exclusive" qualifier, your trigger parameters must appear alone (meaning there are no other parameters present except those listed)' }).inject(results);
						if(trigger.qualifiers.maxparams) new Element('li', { text: 'Due to the "maxparams" qualifier, the amount of hash URI parameters must not exceed ' + trigger.qualifiers.maxparams }).inject(results);
						if(trigger.qualifiers.minparams) new Element('li', { text: 'Due to the "minparams" qualifier, the amount of hash URI parameters must not fall below ' + trigger.qualifiers.minparams }).inject(results);
					}
				}
				
				if(trigger.qualifiers)
				{
					if(trigger.qualifiers.strict) new Element('li', { text: 'Due to the "strict" qualifier, your trigger parameters will be evaluated using strict (===) comparison' }).inject(results);
					if(trigger.qualifiers.wildstrict) new Element('li', { text: 'Due to the "wildstrict" qualifier, your wildcards will be evaluated using strict (===) comparison' }).inject(results);
				}
				
				if(trigger.params && trigger.params['*'] == '' && trigger.qualifiers && trigger.qualifiers['exclusive'])
					new Element('li.red', { text: '(WARNING: this type of trigger has been deprecated! Use minparam/maxparam intead.)' }).inject(results);
			});
			
			$$('#test-URI a')[0].addEvent('click', function(e)
			{
				e.stop();
				
				var undertext = $('test-URI-trigger').retrieve('undertext'), URI = undertext.get();
				if(URI)
				{
					var trigger = $('test-trigger-object').retrieve('undertext').get(), trigger = JSON.decode.attempt(trigger) || trigger;
					
					if(!trigger || typeof(trigger.page) == 'undefined')
					{
						$('test-trigger-object').retrieve('undertext').flash();
						return;
					}
					
					if(!hashNav.isLegalHash(URI)) undertext.flash('#FFD700');
					
					console.log('Page: Testing the valid URI(', URI, ') against ', trigger, '...');
					
					/* Parser logic from HashNav.js version 1.0 */
					var lhsplit = URI.split('&&');
					URI = [0, {page:'', pathString:'', pathParsed:''}];
					URI[1]['page'] = lhsplit.shift().substr(hashNav.options.prefix.length+1).clean() || (hashNav.state && hashNav.state.current) || hashNav.options.defaultHome;
					URI[1]['pathString'] = lhsplit.join('&&');
					URI[1]['pathParsed'] = URI[1]['pathString'].parseQueryStringImproved(hashNav.options.queryMakeFalse);
					
					// Warning! >:O
					if((trigger.qualifiers && !hashNav.$_hidden_qlogic_loaded) || (trigger.params && typeof(trigger.params['*']) != 'undefined' && !hashNav.$_hidden_wlogic_loaded))
						console.warn('Page: Warning! One or more of the logical modules required to process parts of your trigger object are either incomplete or missing. Please make sure to import them for an accurate result.');
						
					trigger = $optimize(Object.clone(trigger));
					var match = matches.call(hashNav, URI, trigger);
					console.log('Page: Result -> ', match ? match : false);
				}
				
				else undertext.flash();
			});
			
			console.log('Page: Enabling dynamic module management...');
			$$('#modules h3 span a')[0].addEvent('click', function(e)
			{
				e.stop();
				HNMODS.load.module('all');
			});
			
			$$('#modules ul li a').each(function(item)
			{
				item.store('disabled', false);
				item.addEvent('click', function(e)
				{
					e.stop();
					
					if(!this.retrieve('disabled'))
					{
						var script = this.getProperty('title');
						this.store('disabled', true).getParent().addClass('disabled');
						this.set('html', 'Loading module <span class="special">'+script+'</span>...');
						
						// Load 'er up!
						HNMODS.load.module(script);
					}
				});
			});
			
			console.log('Mapping relations between the listed methods and their sponsoring modules...');
			$$('li[rel]').each(function(item){ item.addClass('disabled'); });
			
			console.log('Page: Ready!');
			console.groupEnd('Verbose Setup Debug');
			console.log('Page: Feel free to Ctrl-S this site (no dependencies!) or create another instance of the HashNav class (it\'s a singleton, all instances reference the same object). Heck, you can even call HashNav\'s methods through the JavaScript console. All of MooTools 1.4.5 (core+more) and some of HashNav\'s internal private methods are all here for you to play with!');
			console.log('Use the links at the very top of the page to load the modules you\'d like to test out. You can also load modules by typing "HNMODS.load.module(\'modulename\');" into this console (no quotes).');
			console.log('Moreover, method names marked in green have not had their sponsoring module loaded yet. Once loaded, the method will change colors to black.');
			console.log('\nNeed an example to get ya started? Here, try typing this into your console: var h = new HashNav(); h.triggerEvent();\n\n');
			console.groupCollapsed('Notes');
			console.log('Page: Note that input fields with dotted borders and slightly darker backgrounds denote optional fields.');
			console.log('Page: Also note that all advanced trigger logic (wildcards and qualifiers) has been modularized and needs to be imported to be used. (i.e. HNMODS.load.module(\'more/HashNav_T-QualifierLogic\'); HNMODS.load.module(\'more/HashNav_T-WildcardLogic\'); )');
			console.groupEnd('Notes');
			console.groupCollapsed('Tips');
			console.log('Page: Pro Tip #1 -> Use "str<...>" (without the quotes, replace "..." with your string) if you want to feed in a literal string. An example would be the string "true". If typed normally, it\'d be intrepreted as the literal boolean true unless presented as "str<true>". Does not work when using JSON notation.');
			console.log('Page: Pro Tip #2 -> Use "args<argument1,argument2,...>" (without the quotes, and no spaces between commas) if you want to feed in a comma separated list of values to a method as an argument outside of JSON notation. Can only be used properly on methods that accept only one argument as a parameter!');
			console.log('Page: Pro Tip #3 -> Use "number<num>" (without the quotes, replace num with your number) if you want to feed in a literal number into a method as an argument (doesn\'t work with JSON data). This is mainly for the number 0, which, in some browsers, is always interpreted as a string for some reason.');
			console.log('Page: Pro Tip #4 -> To switch URI parsers AFTER HashNav has been initialized, just change HashNav\'s parser to the one you want ( e.g. hashnav.options.parser = new HashNav.parsers.slash(); ) followed by a call to setInstance ( e.g. hashnav.options.parser.setInstance(hashnav); ). When used outside of this playground, you\'d set the parser as you would any other option when first initializing the HashNav class. Reinitialization will NOT work.');
			console.warn('Page: Warning! Sometimes the console incorrectly folds logs or warnings together or some other weird crap (usually seen when registering a new observer). This is unfortunately prevalent in my favorite browser, Google Chrome, in its most recently updated state. Use navigateTo() to manipulate the hash URI or try firefox + firebug if you see this happening!\n \n ');
			console.groupEnd('Tips');
			console.groupEnd('HashNav Initialization');
			console.log('HashNav: Calling triggerEvent() method initially...');
			if(!hashNav.triggerEvent())
			{
				$('current-hash').set('text', '(waiting...)').setStyle('color', 'green');
				$('previous-hash').set('text', '(waiting...)').setStyle('color', 'green');
				$('hash-prefix').set('text', '(waiting...)').setStyle('color', 'green');
				$('hash-page').set('text', '(waiting...)').setStyle('color', 'green');
				$('hash-path').set('text', '(waiting...)').setStyle('color', 'green');
				$('hash-legal').set('text', '(waiting...)').setStyle('color', 'green');
				console.warn('Trigger failed. Hash field is empty.');
			}
		}
		
		if(location.search == '?autoloadDOM=1')
			HNMODS.load.module('HashNav.DOM', clbk);
		else clbk();
	}
});