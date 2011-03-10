/*
JavaScript Document
 
Programming on the internet the way it was meant to be done.
 
By Xunnamius; Copyright (c) 2011+ Dark Gray. All Rights Reserved.
 
Do not remove this header.
*/

/*
	Version 0.6.1
	-----------
	
	Documentation Here
	(use onfocus + onblur + giveStyle = false to give text custom styling)
*/

var UnderText = new Class(
{
	Implements: [Options, Events],
	Binds: ['show', 'hide'],
	
	options: { textOverride: false, catchSubmit: true, flashOnError: true, flashColor: '#FAA', disable: [null], stopSubmit: true, giveStyle: true, color: '#888', dynamicType: true },
	
	initialize: function(element, options)
	{
		this.element = document.id(element);
		this.password = this.element.getProperty('type') == 'password';
		this.originalColor = this.element.getStyle('color');
		this.setOptions(options);
		
		if(!this.options.textOverride) this.options.textOverride = this.element.getProperty('value') || this.element.getProperty('alt') || this.element.getProperty('title') || 'undertext';
		
		this.element.addEvents({ focus: this.hide, blur: this.show });
		this.element.setProperty('value', this.options.textOverride);
		if(this.password && this.options.dynamicType) this.element.setProperty('type', 'text');
		if(this.options.giveStyle) this.element.setStyle('color', this.options.color);
		
		if(this.options.catchSubmit)
		{
			var parent = this.element.getParent('form');
			parent.addEvent('submit', function(e)
			{
				if(this.options.stopSubmit) e.stop();
				var target = this.element.getProperty('value');
				
				if(this.options.disable)
				{
					if(!this.options.disable[0]) this.options.disable = [this.options.disable];
					this.options.disable.each(function(item){ item.disabled = true; });
				}
				
				if(!target || target == this.options.textOverride)
				{
					if(this.options.flashOnError) this.flash();
					parent.fireEvent('failure', this.element, e);
					if(this.options.disable) this.options.disable.each(function(item){ item.disabled = false; });
				}
				
				else parent.fireEvent('success', this.element, e);
			}.bind(this));
		}
		
		return this;
	},

	toElement: function(){ return this.element; },
	
	hide: function()
	{
		if(this.element.getProperty('value') == this.options.textOverride) this.element.setProperty('value', '');
		if(this.password && this.options.dynamicType) this.element.setProperty('type', 'password');
		if(this.options.giveStyle) this.element.setStyle('color', this.originalColor);
	},
	
	show: function()
	{
		if(!this.element.getProperty('value').length)
		{
			if(this.password && this.options.dynamicType) this.element.setProperty('type', 'text');
			if(this.options.giveStyle) this.element.setStyle('color', this.options.color);
			this.element.setProperty('value', this.options.textOverride);
		}
	},
	
	get: function()
	{
		if(this.element.getProperty('value') == this.options.textOverride) return '';
		else return this.element.getProperty('value');
	},
	
	flash: function(color){ this.element.highlight(color || this.options.flashColor); }
});