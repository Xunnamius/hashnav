/*
---
description: Addition of the unserialize() method to the HashNav class. Requires the HashNav core to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [HashNav.unserialize]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({
		
		unserialize: function(restoreParadigm, fireEventOnNav, cookieName, secure, customdata)
		{
			var buffer = {}, metadata = null, cookieName = cookieName || this.options.externalConstants[1];
			
			if(customdata) buffer = customdata;
			else
			{
				if(secure !== true) secure = false;
				if(restoreParadigm !== false) restoreParadigm = true;
				if(fireEventOnNav !== false) fireEventOnNav = true;
				
				buffer['version'] = JSON.decode(decodeURIComponent(Cookie.read(cookieName+'version')), secure);
				if(!buffer['version'] || version.toString() != buffer['version']['v'].toString()) return false;
				metadata = buffer['version']['s'];
				
				Object.each(metadata, function(value, key)
				{
					if(value > 1)
					{
						while(value--) buffer[key] = Cookie.read(cookieName+key+value) + (buffer[key] ? buffer[key] : '');
						buffer[key] = JSON.decode(decodeURIComponent(buffer[key]), secure);
					}
					
					else buffer[key] = JSON.decode(decodeURIComponent(Cookie.read(cookieName+key)), secure);
				});
			}
			
			if(restoreParadigm)
			{
				if(Object.every(buffer, function(item){ return !!item; }) && buffer.version && buffer.options && buffer.state && (!this.$_hidden_history_loaded || buffer.history))
				{
					version = buffer.version.v;
					this.setOptions(buffer.options);
					state = buffer.state;
					if(this.$_hidden_history_loaded) this.replace(buffer.history);
					return this.navigateTo(-1, fireEventOnNav);
				}
			
				return false;
			}
			
			return buffer;
		}
		
	});
})();