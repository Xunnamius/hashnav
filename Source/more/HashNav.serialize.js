/*
---
description: Addition of the serialize() method to the HashNav class. Requires the HashNav core and HashNav.deserialize() to function.

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core: [HashNav.deserialize]

provides: [HashNav.serialize]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	HashNav.implement({
		
		serialize: function(cookieName, nowrite)
		{	
			var cookie_BUFFER = { 'options':[], 'state':[] },
			cookieName = cookieName || this.options.externalConstants[1], cookies = 4,
			
			splitter = function(temp, datatype, recurse)
			{
				if(!recurse) temp = encodeURIComponent(JSON.encode(temp));
				
				if(temp.length > this.options.cookieDataHardLimits[0])
				{
					cookies++;
					
					if(cookies <= this.options.cookieDataHardLimits[1])
					{
						cookie_BUFFER[datatype].push(temp.substring(0, this.options.cookieDataHardLimits[0]));
						temp = temp.substr(this.options.cookieDataHardLimits[0]);
						return splitter(temp, datatype, true);
					}
					
					return false;
				}
				
				cookie_BUFFER[datatype].push(temp);
				return true;
			}.bind(this);
			
			this.deserialize(cookieName);
			splitter(this.options, 'options');
			splitter(state, 'state');
			
			if(this.$_hidden_history_loaded)
			{
				cookie_BUFFER.history = [];
				splitter(history, 'history');
			}
			
			if(cookies > this.options.cookieDataHardLimits[1]) return false;
			
			if(!nowrite)
			{
				var c = { 'v': version, 's': { 'options': cookie_BUFFER.options.length, 'state': cookie_BUFFER.state.length } };
				if(this.$_hidden_history_loaded) c.history = cookie_BUFFER.history.length;
				
				Cookie.write(cookieName+'version', encodeURIComponent(JSON.encode(c)), this.options.cookieOptions);
			
				Object.each(cookie_BUFFER, function(value, key)
				{
					if(value.length > 1) value.each(function(item, i){ Cookie.write(cookieName+key+i, item, this.options.cookieOptions); }, this);
					else Cookie.write(cookieName+key, value[0], this.options.cookieOptions);
				}, this);
				
				return true;
			}
			
			else return cookie_BUFFER;
		}
		
	});
})();