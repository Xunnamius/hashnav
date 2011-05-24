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
			/*Object.each(trigger.params, function(value, key)
			{
				if(trigger.params['*'])
				{*/
					var value = trigger.params['*'];
					if(typeof(value) == 'boolean')
					{
						var temp = trigger.params['*'];
						delete trigger.params['*'];
						if(!Object.contains(trigger.params, temp)) trigger.params['*'] = temp;
					}
					
					else if(value === '~' && trigger.qualifiers)
					{
						delete trigger.qualifiers;
						delete trigger.params;
						trigger.params = {};
						trigger.params['*'] = '~';
					}
					
					else if(value === '' && Object.getLength(trigger.params) > 1) delete trigger.params['*'];
					
					else if(
						(trigger.qualifiers && (typeof(trigger.qualifiers.minparams) != 'undefined' || typeof(trigger.qualifiers.maxparams) != 'undefined')) ||
						(typeof(value) != 'boolean' && value !== '~' && value !== '' && trigger.qualifiers && trigger.qualifiers.exclusive))
					  delete trigger.qualifiers.exclusive;
				/*}
			});*/
			
			return trigger;
		}.protect(),
		
		$_hidden_wlogic_scan: function(trigger, map)
		{
			var returnval = false;
			
			if(item === '~' && (!map.path || Object.getLength(map.path) == 0)) returnval = map.satisfied = true;
			else if(Object.getLength(map.path))
			{
				// Ninja Art: Empty Wildcard Parameter Plus Exclusive Qualifier Jutsu!
				if(item === '' && ((trigger.qualifiers && trigger.qualifiers.exclusive && Object.getLength(map.path) == 1) || (!trigger.qualifiers && Object.getLength(map.path)))) returnval = map.satisfied = true;
				else
				{
					var temp = trigger.params['*'];
					delete trigger.params['*'];
					
					if((item === true  && Object.contains(map.path, true)) ||
					 (item === false && Object.contains(map.path, (this.options.makeFalse ? false : ''))) ||
					 (item !== '' && (Object.values(map.path).every(function(value){ returnval = (map.wildstrict ? value === item : value.toString() == item.toString()); }))))
					 {
						 trigger.params['*'] = temp;
						 returnval = true;
					 }
				 
					trigger.params['*'] = temp;
				}
			}
			
			return [trigger, map, returnval];
		}
		
	});
})();