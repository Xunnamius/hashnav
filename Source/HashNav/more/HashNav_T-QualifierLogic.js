/*
---
description: Grants the HashNav core the ability to process trigger qualifiers.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core
- provided: [Object.compare]

provides: [Logic]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({
		
		$_hidden_qlogic_loaded: true,
		$_hidden_qlogic_optimize: function(trigger)
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
		}.protect(),
		
		$_hidden_qlogic_openScan: function(trigger, map)
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
		}.protect(),
		
		$_hidden_qlogic_closeScan: function(trigger, map)
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
		}.protect()
		
	});
})();