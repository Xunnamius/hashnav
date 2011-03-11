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
			var undertext = $('test-scrlTo-element').retrieve('undertext'), element = undertext.get();;
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
		$('test-setOptions')
		
		console.log('Page: Ready!');
		console.log('Page: Feel free to create another instance of the HashNav class (it\'s a singleton, all instances reference the same object) and call any of the methods through the JavaScript console');
		console.log('Page: Note that input fields with dotted borders and slightly darker backgrounds denote optional fields.');
		console.log('Page: Pro Tip #1 -> Use "str<...>" (without the quotes, replace "..." with your string) if you want to feed in a literal string. An example would be the string "true". If typed normally, it\'d be intrepreted as the literal boolean true unless presented as "str<true>". Does not work when using JSON notation.');
		console.log('Page: Pro Tip #2 -> Use "args<argument1,argument2,...>" (without the quotes, and no spaces between commas) if you want to feed in a comma separated list of values to a method as an argument outside of JSON notation. Can only be used properly on methods that accept only one argument as a parameter!');
		console.log('Page: Pro Tip #3 -> Use "number<num>" (without the quotes, replace num with your number) if you want to feed in a literal number into a method as an argument (doesn\'t work with JSON data). This is mainly for the number 0, which, in some browsers, is always interpreted as a string for some reason.');
		console.warn('Page: Warning! Sometimes the console incorrectly folds logs or warnings together or some other weird crap. This is unfortunately prevalent in my favorite browser, Google Chrome, in its most recently updated state. Clear the console or try firefox + firebug when you see this happening!');
		console.log('');
		console.log('---');
		console.log('');
		
		console.log('HashNav: Calling triggerEvent() method initially...');
		hashNav.triggerEvent();
	}
});