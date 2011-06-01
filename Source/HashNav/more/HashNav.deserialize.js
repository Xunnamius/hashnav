/*
---
description: Addition of the deserialize() method to the HashNav class. Requires the HashNav core and HashNav.unserialize() to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- core/1.3: [Cookie]
- HashNav/core: [HashNav.unserialize]

provides: [HashNav.deserialize]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({
		
		deserialize: function(cookieName)
		{
			var buffer = this.unserialize(false, false, cookieName, true, null);
			
			if(buffer && buffer.version && buffer.version.s && buffer.options)
			{
				var cookieName = buffer.options.externalConstants[1] || this.options.externalConstants[1],
				metadata = buffer.version.s;
				
				if(!cookieName) return false;
				
				Object.each(metadata, function(value, key)
				{
					if(value > 1)
						while(value--) Cookie.dispose(cookieName+key+value, buffer.options.cookieOptions);
					else Cookie.dispose(cookieName+key, buffer.options.cookieOptions);
				});
				
				Cookie.dispose(cookieName+'version', buffer.options.cookieOptions);
				return true;
			}
			
			return false;
		}
		
	});
})();