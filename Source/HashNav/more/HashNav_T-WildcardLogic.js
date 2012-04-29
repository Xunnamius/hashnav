/*
---
description: Grants the HashNav core the ability to process trigger wildcards.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [Logic]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({
		
		$_hidden_wlogic_loaded: true,
		$_hidden_wlogic_optimize: function(trigger)
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
		}.protect(),
		
		$_hidden_wlogic_scan: function(trigger, map)
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
					   (Object.values(map.path).every(function(value){ return (map.wildstrict ? value === item : value.toString() == item.toString()); })))
						 returnval = true;
				}
				
				trigger.params['*'] = item;
			}
			
			return [trigger, map, returnval];
		}.protect()
		
	});
})();