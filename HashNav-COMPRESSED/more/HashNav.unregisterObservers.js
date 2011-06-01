/*
---
description: Addition of the unregisterObservers() method to the HashNav class. Requires the HashNav core to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [HashNav.unregisterObservers]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	var observernames = [];
	
	HashNav.implement({
		
		$_hidden_unregisterObservers_loaded: true,
		unregisterObservers: function()
		{
			var removalObj = arguments;
			if(arguments[0] == 'all') removalObj = observernames;
			Object.each(removalObj, function(item){ this.unregisterObserver(item); }, this);
		},
		
		updateRemote: function(observers)
		{
			observernames = observers;
		}.protect()
		
	});
})();