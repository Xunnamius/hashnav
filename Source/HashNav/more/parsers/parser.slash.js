/*
---
description: A URI parser for the MooTools HashNav class

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [HashNav.parser.slash]
...
*/

HashNav.parsers.slash = new Class({
	Extends: HashNav.parsers.GeneralHashURIParser,
	
	initialize: function(symbol)
	{ this.symbol = symbol || '/'; },
	
	parse: function(uri)
	{
		this.parsed = uri.split(this.symbol);
		this.pagestr = this.parsed.shift();
		this.pathstr = this.parsed.join(this.symbol);
		this.pathparse = {};
		
		while(this.parsed.length)
			this.pathparse[this.parsed.shift()] = (this.parsed.shift() || '');
		
		return { page: this.pagestr, pathString: this.pathstr, pathParsed: this.pathparse };
	},
	
	createURIMode1String: function(data)
	{
		if(data.charAt(0) == '#') return data;
		
		// Keeping with linux-style absolube vs. relative URI notation
		else if(data.charAt(0) == this.symbol) return this.instance.options.prefix + data.substr(1);
		else return window.location.hash + (window.location.hash.substr(-1) == this.symbol ? '' : this.symbol) + data;
	},
	
	parseObjectToQueryString: function(obj)
	{
		return Object.toQueryString(obj).replace(/=|&/gi, this.symbol);
	}
});