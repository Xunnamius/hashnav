(function(){HashNav.implement({serialize:function(d,f){var a={options:[],state:[]},b=this.$_hidden_pseudoprivate_getState(),h=b[1],b=b[0],d=d||this.options.externalConstants[1],g=4,e=function(c,b,d){d||(c=encodeURIComponent(JSON.encode(c)));if(c.length>this.options.cookieDataHardLimits[0]){g++;if(g<=this.options.cookieDataHardLimits[1])return a[b].push(c.substring(0,this.options.cookieDataHardLimits[0])),c=c.substr(this.options.cookieDataHardLimits[0]),e(c,b,!0);return!1}a[b].push(c);return!0}.bind(this);
f||this.deserialize(d);if(this.options.cookieOptions.document===document)this.options.cookieOptions.document=null;if(f)a.options=encodeURIComponent(JSON.encode(this.options)),a.state=encodeURIComponent(JSON.encode(b)),this.$_hidden_history_loaded&&(a.history=encodeURIComponent(JSON.encode(this.history.get("all"))));else if(e(this.options,"options"),e(b,"state"),this.$_hidden_history_loaded)a.history=[],e(this.history.get("all"),"history");if(this.options.cookieOptions.document===null)this.options.cookieOptions.document=
document;if(g>this.options.cookieDataHardLimits[1])return!1;if(f)return a.version={v:h},a;else{b={v:h,s:{options:a.options.length,state:a.state.length}};if(this.$_hidden_history_loaded)b.history=a.history.length;Cookie.write(d+"version",encodeURIComponent(JSON.encode(b)),this.options.cookieOptions);Object.each(a,function(a,b){a.length>1?a.each(function(a,c){Cookie.write(d+b+c,a,this.options.cookieOptions)},this):Cookie.write(d+b,a[0],this.options.cookieOptions)},this);return!0}}})})();