/*
---
description: Slight improvement on the functionality of the String.QueryString set of methods

license: MIT-style license

authors:
- Xunnamius

requires:
- more/1.3.0.1: [String.QueryString]

provides: [String.parseQueryStringImproved, String.parseObjectToQueryString]
...
*/

/* documentation and updates @ http://github.com/Xunnamius/HashNav */
(function() // Private
{
	/* Slightly modified versions from MooTools More | script: String.QueryString.js | license: MIT-style license */
	
	String.implement({
		
		/* Slightly modified version from MooTools More | script: String.QueryString.js | license: MIT-style license */
		parseQueryStringImproved: function(makeFalse) // Parse Query String
		{
			queryString = this.trim();
			var vars = queryString.split(/[&;]/), object = {};
			if(!vars.length || !queryString.length) return object;
			
			vars.each(function(val)
			{
				var index = val.indexOf('='),
					value = index < 0 ? true : val.substr(index + 1),
					key = val.substr(0, index),
					keys = index < 0 ? [val] : key.match(/([^\]\[]+|(\B)(?=\]))/g),
					obj = object;
				
				if(makeFalse && value.length === 0) value = false;
				if(typeof(value) != 'boolean') value = decodeURIComponent(value);
				
				keys.each(function(key, i)
				{
					key = decodeURIComponent(key);
					var current = obj[key];
					
					if(i < keys.length - 1) obj = obj[key] = current || {};
					else if(typeof(current) == 'object') current.push(value);
					else obj[key] = current != null ? [current, value] : value;
				});
			});
	
			return object;
		},
		
	});
	
	Object.extend({
		
		parseObjectToQueryString: function() // Parse (JSON-like) Object To Query String
		{
			var qs = '', obj = this;
			
			Object.each(obj, function(item, index)
			{
				if(item === true)
				{
					if(qs) qs = qs + '&' + index;
					else qs += index;
					delete obj[index];
				}
				
				else if(item === false)
				{
					var news = index + '=';
					if(qs) qs = qs + '&' + news;
					else qs += news;
					delete obj[index];
				}
			});
			
			obj = Object.toQueryString(obj);
			return qs + (obj && qs ? '&'+obj : obj);
		}
		
	});
})();