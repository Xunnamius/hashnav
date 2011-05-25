/*
---
description: Addition of the Fx object and its various methods to the HashNav object. Requires the HashNav core to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- more/1.3.0.1: [Fx.Scroll]
- HashNav/core

provides: [HashNav.Fx]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	
	HashNav.implement('Fx',
	{
		
		$_hidden_fx_loaded: true,
		scrl: new Fx.Scroll(window),
		scrlTo: function(elID)
		{
			elID = typeof(elID) == 'string' ? document.id(elID) : elID;
			if(elID) this.scrl.toElement(elID);
		}
		
	});
	
})();