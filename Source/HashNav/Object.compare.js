/*
---
description: Extends the Object type with a public compare method.

license: MIT-style license

authors:
- Xunnamius

requires:
- core/1.3.2

provides: [Object.compare]
...
*/

/* Can be used in place of array.compare, watch out for out-of-order arrays though! */
Object.extend({
	
	compare: function(a, b, strict)
	{
		if(!a || !b || Object.getLength(a) != Object.getLength(b)) return false;
		return Object.every(a, function(value, key){ return typeof(value) == 'object' ? Object.compare(value, b[key], strict) : (strict ? b[key] === value : b[key] == value); }, this);
	}
	
});