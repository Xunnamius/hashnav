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
	parsed: null,
	pagestr: null,
	pathstr: null,
	pathparse: null,
	instance: null,
	
	// Gives us a link back to the HashNav class
	setInstance: function(instance)
	{
		this.instance = instance;
	},
	
	// Called to parse the raw window.location.hash (sans prefix)
	//  into data that HashNav can understand.
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
	
	// Used by navigateTo and the like for creating "First Mode" hash URIs
	//  Check the documentation for the navigateTo() method for more info.
	createURIMode1History: function(data)
	{
		// data will be in the form of: number
		var hist = (this.instance.history.get(data) || [null])[0];
		if(hist) return hist;
		else return false; // Bad params
	},
	
	createURIMode1Object: function(data)
	{
		// data will be in the form of: object
		return this.instance.options.prefix + this.instance.getCurrent() + this.symbol + this.parseObjectToQueryString(data);
	},
	
	createURIMode1String: function(data)
	{
		// data will be in the form of: string
		if(data.charAt(0) == '#') return data;
		
		// Keeping with linux-style absolube vs. relative URI notation
		else if(data.charAt(0) == this.symbol) return this.instance.options.prefix + data.substr(1);
		else return window.location.hash + (window.location.hash.substr(-1) == this.symbol ? '' : this.symbol) + data;
	},
	
	// Used by navigateTo and the like for creating "Second Mode" hash URIs
	//  Check the documentation for the navigateTo() method for more info.
	createURIMode2: function(data)
	{
		// data will be in the form of: [string, mixed]
		return this.instance.options.prefix + data[0] + this.symbol + (typeof(data[1]) == 'object' ? this.parseObjectToQueryString(data[1]) : data[1]);
	},
	
	// Used by navigateTo and the like for creating "Third Mode" hash URIs
	//  Check the documentation for the navigateTo() method for more info.
	createURIMode3: function(data)
	{
		// data will be in the form of: [string, string, mixed]
		return data[0] + data[1] + this.symbol + (typeof(data[2]) == 'object' ? this.parseObjectToQueryString(data[2]) : data[2]);
	},
	
	// Parse (JSON-like) Object To Query String
	parseObjectToQueryString: function(obj)
	{
		return Object.toQueryString(obj).replace(/=|&/gi, this.symbol);
	}
});