/*
---
description: Addition of three DOM methods to the Element type. Requires the HashNav core to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [Element.observe, Element.observing, Element.unobserve]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({ $_hidden_DOM_loaded: true });
	Element.implement({
						
		observe: function(trigger, fn, args, scrollToElement)
		{
			var tempref = new HashNav(),
			name = this.getProperty('id') || this.getProperty('class') || this.getProperty('name') || this.get('tag');
			if(scrollToElement === true) scrollToElement = this;
			this.store(tempref.options.externalConstants[0], name);
			tempref.registerObserver(name, trigger, fn, args, this, scrollToElement);
			tempref = null;
			return this;
		},
		
		observing: function()
		{
			var tempref = new HashNav(), result = tempref.registeredObserver(this.retrieve(tempref.options.externalConstants[0]));
			tempref = null;
			return result;
		},
		
		unobserve: function()
		{
			var tempref = new HashNav(),
			key = tempref.options.externalConstants[0],
			name = this.retrieve(key);
			if(name) tempref.unregisterObserver(name);
			this.eliminate(key);
			tempref = null;
			return this;
		},
		
	});
})();