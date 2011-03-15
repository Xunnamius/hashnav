var PQS = function(queryString, makeFalse) // Parse Query String
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
};

/* Trigger Optimization logic from HashNav-0.97-FULL.js */
var optimize = function(trigger)
{
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
	
	return trigger;
};

/* Trigger logic from HashNav-0.97-FULL.js */
var matches = function(e, trigger)
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
			
			return true;
		}
	}
};

window.addEvent('domready', function()
{
	if(typeof(console) == 'undefined')
	{
		document.body.setStyle('opacity', '.05');
		alert("This browser either does not have a suitable JavaScript console or it has been disabled. Please enable it and refresh the page.");
	}
	
	else
	{
		console.log('Page: Initializing HashNav class...');
		var hashNav = new HashNav(), change = 0;
		console.log('HashNav: Hello World!');
		
		console.log('HashNav: Setting up initial observers...');
		$('current-hash').observe({ page: false, params: {}}, function(e)
		{
			this.set('text', e[0] || '(blank)');
			$('previous-hash').set('text', hashNav.history.get(-2)[0] || '(blank)');
			$('hash-prefix').set('text', hashNav.options.prefix);
			$('hash-page').set('text', e[1].page || '(blank)');
			$('hash-path').set('text', e[1].pathString || '(blank)');
			$('hash-legal').set('text', hashNav.isLegalHash() ? 'Legal' : 'Illegal').setStyle('color', (hashNav.isLegalHash() ? 'green' : 'red'));
			console.log('DOM Element: Hash URI change observed! Resulting hash URI: (change #'+(++change)+') ', e.clone());
		});
		
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
					console.warn('HashNav: New Options Set! ', json);
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
					var logic = (method.contains('.') ? Object.getFromPath(hashNav, method) : (elementMethod ? $('scrollto')[method] : hashNav[method])).apply((elementMethod ? $('scrollto') : hashNav), args);
					console.log('HashNav: Result -> ', typeof(logic) == 'undefined' ? '(method doesn\'t return a result)' : logic);
				}
			});
		});
		
		$('test-scrl').getElements('a')[0].addEvent('click', function(e)
		{
			e.stop();
			console.log('HashNav Class: Attempting to interrogate the scrl property...');
			console.log('HashNav Class: Result -> ', HashNav.scrl, ' (instance of Fx.Scroll)');
		}.bind(this));
		
		$('test-scrlTo').getElements('a')[0].addEvent('click', function(e)
		{
			e.stop();
			var undertext = $('test-scrlTo-element').retrieve('undertext'), element = undertext.get();
			if(element)
			{
				console.log('HashNav Class: Attempting to call HashNav::scrlTo(', element, ') ...');
				console.log('HashNav Class: Result -> (method doesn\'t return a result)');
				HashNav.scrlTo(element);
				
				if($('test-scrlTo-back').checked)
				{
					console.log('HashNav Class: Automatically scrolling back to the top in 5 seconds...');
					(function()
					{
						console.log('Page: Scrolling back!');
						HashNav.scrlTo('test-scrlTo')
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
			
			if(!trigger || !trigger.page || !trigger.params)
			{
				$('test-trigger-object').retrieve('undertext').flash();
				new Element('li', { text: '(empty)' }).inject(results);
				return;
			}
			
			else new Element('li', { text: '(loading...)' }).inject(results);
			opttrig = optimize.call(hashNav, Object.clone(trigger));
			if(!Object.compare(trigger, opttrig))
			{
				results.getFirst('li').set('text', 'Your trigger was optimized!');
				new Element('li', { text: 'Old trigger: ' + JSON.encode(trigger) }).inject(results);
				new Element('li', { text: 'New trigger: ' + JSON.encode(opttrig) }).inject(results);
				trigger = opttrig;
				new Element('li', { text: 'Your trigger will activate when the following conditions are met...' }).inject(results);
			}
			
			else results.getFirst('li').set('text', 'Your trigger will activate when the following conditions are met...');
			
			// Trigger logic
			if(trigger.page === false) msg = 'The hash URI changes (even illegally)';
			else if(trigger.page === true) 	msg = 'The state designator changes (legally)';
			else if(trigger.page === '') 	msg = 'The state designator is the same as the defaultHome setting';
			else msg = 'The state designator == ' + trigger.page;
			new Element('li', { text: msg }).inject(results);
			
			if(!Object.getLength(trigger.params)) new Element('li', { text: (trigger.qualifiers && trigger.qualifiers.exclusive ? 'The hash URI is not allowed to have any parameters!' : 'The hash URI may contain any number of parameters!') }).inject(results);
			else if(trigger.params['*'] && trigger.params['*'] === '~') new Element('li', { text: 'Wildcard: The hash URI is not allowed to have any parameters!' }).inject(results);
			else 
			{
				if(trigger.params['*'] && trigger.params['*'] !== '' && trigger.params['*'] !== true && trigger.params['*'] !== false)
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
						 else msg = index + ' is present within the hash URI and equals ' + item;
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
		});
		
		$$('#test-URI a')[0].addEvent('click', function(e)
		{
			e.stop();
			
			var undertext = $('test-URI-trigger').retrieve('undertext'), URI = undertext.get();
			if(URI)
			{
				var trigger = $('test-trigger-object').retrieve('undertext').get(), trigger = JSON.decode.attempt(trigger) || trigger;
				
				if(!trigger || !trigger.page || !trigger.params)
				{
					$('test-trigger-object').retrieve('undertext').flash();
					return;
				}
				
				if(!hashNav.isLegalHash(URI))
				{
					undertext.flash('#FFD700');
				}
				
				console.log('Page: Testing the valid URI(', URI, ') against ', trigger, '...');
				
				/* Parser logic from HashNav-0.97-FULL.js */
				var lhsplit = URI.split('&&');
				URI = [0, {page:'', pathString:'', pathParsed:''}];
				URI[1]['page'] = lhsplit.shift().substr(hashNav.options.prefix.length+1).clean() || hashNav.state.current || hashNav.options.defaultHome;
				URI[1]['pathString'] = lhsplit.join('&&');
				URI[1]['pathParsed'] = PQS(URI[1]['pathString'], hashNav.options.queryMakeFalse);
				
				trigger = optimize.call(hashNav, trigger);
				var match = matches.call(hashNav, URI, trigger);
				console.log('Page: Result -> ', match ? match : false);
			}
			
			else undertext.flash();
		});
		
		console.log('Page: Ready!');
		console.log('Page: Feel free to create another instance of the HashNav class (it\'s a singleton, all instances reference the same object) and call any of the methods through the JavaScript console. All of MooTools 1.3 is here for you to play with!');
		console.log('Need an example? Here, try typing this into your console: var h = new HashNav();');
		console.log('Page: Note that input fields with dotted borders and slightly darker backgrounds denote optional fields.');
		console.log('Page: Pro Tip #1 -> Use "str<...>" (without the quotes, replace "..." with your string) if you want to feed in a literal string. An example would be the string "true". If typed normally, it\'d be intrepreted as the literal boolean true unless presented as "str<true>". Does not work when using JSON notation.');
		console.log('Page: Pro Tip #2 -> Use "args<argument1,argument2,...>" (without the quotes, and no spaces between commas) if you want to feed in a comma separated list of values to a method as an argument outside of JSON notation. Can only be used properly on methods that accept only one argument as a parameter!');
		console.log('Page: Pro Tip #3 -> Use "number<num>" (without the quotes, replace num with your number) if you want to feed in a literal number into a method as an argument (doesn\'t work with JSON data). This is mainly for the number 0, which, in some browsers, is always interpreted as a string for some reason.');
		console.warn('Page: Warning! Sometimes the console incorrectly folds logs or warnings together or some other weird crap (usually seen when registering a new observer). This is unfortunately prevalent in my favorite browser, Google Chrome, in its most recently updated state. Clear the console or try firefox + firebug when you see this happening!\n \n ');
		console.log('HashNav: Calling triggerEvent() method initially...');
		hashNav.triggerEvent();
	}
});

Object.extend({
	
	compare: function(a, b, strict)
	{
		if(!a || !b || Object.getLength(a) != Object.getLength(b)) return false;
		return Object.every(a, function(value, key){ return typeof(value) == 'object' ? Object.compare(value, b[key], strict) : (strict ? b[key] === value : b[key] == value); }, this);
	}
	
});