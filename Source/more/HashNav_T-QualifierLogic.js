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
			if(trigger.qualifiers.exclusive && Object.every(trigger.params, function(item){ return item === '~'; }))
			{
				delete trigger.qualifiers;
				delete trigger.params;
				trigger.params = {};
				trigger.params['*'] = '~';
			}
			
			return trigger;
		}.protect(),
		
		$_hidden_qlogic_openScan: function(trigger, map)
		{
			var returnval = false;
			
			if(trigger.qualifiers)
			{
				if(trigger.qualifiers.strict) map.strict = true;
				if(trigger.qualifiers.wildstrict) map.wildstrict = true;
				if(trigger.qualifiers.maxparams < Object.getLength(map.path) || trigger.qualifiers.minparams > Object.getLength(map.path)) returnval = true;
			}
			
			return [trigger, map, returnval];
		},
		
		$_hidden_qlogic_closeScan: function(trigger, map)
		{
			var returnval = false;
			
			if(trigger.qualifiers.exclusive)
			{
				var params = Object.clone(trigger.params);
				params = Object.filter(params, function(value, key)
				{
					if(value == '~') return false;
					return true;
				});
				
				if(Object.getLength(params) !== Object.getLength(map.path)) returnval = true;
			}
			
			if(!returnval && trigger.qualifiers.explicitChange)
				returnval = Object.compare(this.history.get(-2)[1]['pathParsed'], this.history.get(-1)[1]['pathParsed']);
			
			// More coming soon
			
			return [trigger, map, returnval];
		}
		
	});
})();