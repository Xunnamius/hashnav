/*
---
description: A traditional "PHP-style" URI parser for the MooTools HashNav class

license: MIT-style license

authors:
- Xunnamius

requires:
- HashNav/core

provides: [HashNav.parsers.ampersand]
...
*/

HashNav.parsers.ampersand = new Class({
	Extends: HashNav.parsers.GeneralHashURIParser,

	initialize: function(separators)
	{ this.separators = separators || { main: '&&', pair: '&', field: '=' }; },
	
	parse: function(uri)
	{
		this.parsed = uri.split(this.separators.main);
		this.pagestr = this.parsed.shift();
		this.pathstr = this.parsed.join(this.separators.main);
		this.pathparse = this.pathstr.parseQueryStringImproved(this.instance.options.queryMakeFalse);
		return { page: this.pagestr, pathString: this.pathstr, pathParsed: this.pathparse };
	},
	
	createURIMode1String: function(data)
	{
		if(data.charAt(0) == '#') return data;
		else if(data.charAt(0) == '&' && data.charAt(1) != '&')
			return data += (this.instance.has('all') ? data : (wlh.contains('&&') ? data.substr(1) : '&'+data));
		else return this.instance.options.prefix + data;
	},
	
	parseObjectToQueryString: function(obj)
	{
		return Object.parseObjectToQueryString(obj);
	}
});