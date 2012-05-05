/*
---
description: Addition of the history object and its methods to the HashNav object. Requires the HashNav core to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [HashNav.history]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function($) // Private
{
	var history = [];
	
	/* Public methods */
	HashNav.implement('history',
	{
		get: function(entry)
		{
			if(entry == 'all')
				return Array.clone(history).each(function(item, i, a){ if(parseInt(item)+1) a[i] = a[item]; }); // Reverse the internal history optimization for the cloned history object
			
			entry = parseInt(entry),
			negen = history.length + entry;
			
			if(entry >= 0) negen = history[entry];
			else if(negen < history.length && negen >= 0) negen = history[negen];
			else negen = null;
			
			if(negen && typeof(negen) == 'object') return negen;
			if(parseInt(negen)+1) return history[negen];
			else return false;
		},
		
		truncate: function(count)
		{
			if(!history.length)
				return false;
			else if(count >= history.length)
				return this.history.clear();
			else if(count > 0)
			{
				history.splice(0, count);
				return true;
			}
			
			return false;
		},
		
		clear: function()
		{
			history = [];
			return true;
		}
	});
	
	/* "Private" utility methods */
	HashNav.implement({
		
		$_hidden_history_loaded: true,
		push: function(lochash)
		{
			history.every(function(item, i)
			{
				if(item[0] == lochash[0])
				{
					lochash = i;
					return false;
				}
				
				return true;
			}.bind(this));
			
			history.push(lochash);
		}.protect(),
		
		replace: function(newhist)
		{ history = newhist; }.protect()
		
	});
})(document.id);