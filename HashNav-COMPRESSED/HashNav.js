(function(){var g=null,d={},j=1.01,c={polling:!1,"native":!1,current:"",storedHash:["",{page:"",pathString:"",pathParsed:null}]};this.HashNav=new Class({Implements:[Options,Events],options:{interval:200,prefix:"!/",defaultHome:"home",cleanQueryString:!1,queryMakeFalse:!1,externalConstants:["NAVOBJOBSDATA","NAVOBJSERDATA"],cookieOptions:{path:"/",domain:!1,duration:365,secure:!1,document:document,encode:!1},cookieDataHardLimits:[2E3,6],ignoreVersionCheck:!1,explicitHashChange:!0},initialize:function(a){if(g)return g;
else this.setOptions(a),!Browser.ie7&&"onhashchange"in window?(c["native"]=!0,window.onhashchange=this.poll.bind(this),this.poll()):this.startPolling(),g=this},startPolling:function(){return this.isNative()?!1:(this.poll(),c.polling=setInterval(this.poll.bind(this),this.options.interval),!0)},stopPolling:function(){if(c.polling)return clearInterval(c.polling),c.polling=!1,!0;return!1},poll:function(){var a;if((a=window.location.hash)&&this.getStoredHashData()[0]!=a)c.storedHash[0]=a.length?a:"#",
this.isLegalHash()?(a=a.split("&&"),c.storedHash[1].page=a.shift().substr(this.options.prefix.length+1).clean()||this.getCurrent()||this.options.defaultHome,c.current=c.storedHash[1].page,c.storedHash[1].pathString=a.join("&&"),c.storedHash[1].pathParsed=this.options.cleanQueryString?c.storedHash[1].pathString.cleanQueryString():c.storedHash[1].pathString.parseQueryStringImproved(this.options.queryMakeFalse),this.$_hidden_history_loaded&&this.push(this.getStoredHashData().clone())):(c.storedHash[1].page=
"",c.current="",c.storedHash[1].pathString="",c.storedHash[1].pathParsed=null),this.triggerEvent()},registerObserver:function(a,b,c,g,h,i){if(!b.params)b.params={};h||(h=this);if(!b||typeof b.page=="undefined")return!1;else!this.$_hidden_wlogic_loaded&&b.params&&typeof b.params["*"]!="undefined"&&delete b.params["*"],b.qualifiers&&this.$_hidden_qlogic_loaded?b=this.$_hidden_qlogic_optimize(b):b.qualifiers&&delete b.qualifiers,typeof b.params["*"]!="undefined"&&this.$_hidden_wlogic_loaded&&(b=this.$_hidden_wlogic_optimize(b));
d[a]||(d[a]=[]);d[a].push([function(a){if(a=a[1]){var d=-1;this.$_hidden_history_loaded&&((d=this.history.get(-2))||(d=this.history.get(-1)?-2:-1));var e={path:a.pathParsed,satisfied:!1,strict:!1,wildstrict:!1};if(b.qualifiers&&this.$_hidden_qlogic_loaded){var f=this.$_hidden_qlogic_openScan(b,e);b=f[0];e=f[1];if(f[2])return}if(b.page===!1||this.isLegalHash()&&(b.page===!0&&(d==-2||d!=-1&&d[1].page&&a.page&&a.page!=d[1].page)||b.page===""&&a.page==this.options.defaultHome||b.page==a.page)){if(b.page===
!1&&!this.isLegalHash())e.satisfied=!0;if(d=Object.every(b.params,function(a,c){if(e.satisfied)return!0;else if(c==="*"){var d=this.$_hidden_wlogic_scan(b,e);b=d[0];e=d[1];return d[2]}else{if(a==="~"&&(!e.path||typeof e.path[c]=="undefined"))return!0;else if(Object.getLength(e.path)&&(a===!0&&e.path[c]===!0||a===!1&&(e.path[c]===""||this.options.makeFalse&&e.path[c]===!1)||a===""&&typeof e.path[c]!="undefined"||e.path[c]&&(e.strict?a===e.path:a.toString()==e.path[c].toString())))return!0;return!1}}.bind(this))){if(b.qualifiers&&
this.$_hidden_qlogic_loaded&&(f=this.$_hidden_qlogic_closeScan(b,e),b=f[0],e=f[1],f[2]))return;this.$_hidden_fx_loaded&&i&&this.Fx.scrlTo(i);c.apply(h,[this.getStoredHashData()].append(Array.from(g)))}}}}.bind(this),b,g,h,i]);this.$_hidden_unregisterObservers_loaded&&this.updateRemote(Object.keys(d));window.addEvent("navchange",d[a].getLast()[0]);return!0},registeredObserver:function(a){return typeof d[a]!="undefined"},unregisterObserver:function(a){if(typeof d[a]!="undefined")return d[a].each(function(a){window.removeEvent("navchange",
a[0])}),delete d[a],this.$_hidden_unregisterObservers_loaded&&this.updateRemote(Object.keys(d)),!0;return!1},navigateTo:function(a){var b=window.location.hash,c=!1;typeof arguments[arguments.length-1]=="boolean"&&(c=arguments[--arguments.length],delete arguments[arguments.length]);if(typeof arguments[0]=="string"&&arguments[1]&&!arguments[2])b=this.options.prefix+arguments[0]+"&&"+(typeof arguments[1]=="object"?Object.parseObjectToQueryString(arguments[1]):arguments[1]);else if(typeof arguments[0]==
"string"&&typeof arguments[1]=="string"&&arguments[2])b=arguments[0]+arguments[1]+"&&"+(typeof arguments[2]=="object"?Object.parseObjectToQueryString(arguments[2]):arguments[2]);else if(typeof a=="number"&&this.$_hidden_history_loaded){if(b=(this.history.get(a)||[null])[0],!b)return!1}else if(typeof a=="object")b=this.options.prefix+this.getCurrent()+"&&"+Object.parseObjectToQueryString(a);else if(typeof a=="string")a.substr(0,1)=="#"?b=a:a.substr(0,1)=="&"&&a.substr(1,1)!="&"?b+=this.has("all")?
a:b.contains("&&")?a.substr(1):"&"+a:b=this.options.prefix+a;else return!1;window.location.hash=b;c?this.triggerEvent():this.poll();return!0},getCurrent:function(){return c.current},getStoredHash:function(){return c.storedHash[1].pathParsed||{}},getStoredHashData:function(){return c.storedHash},get:function(){if(arguments[0]=="all")return this.getStoredHash();var a={},b=this.getStoredHash();Object.each(arguments,function(c){c in b&&(a[c]=b[c])},this);return Object.getLength(a)?arguments.length==1?
a[arguments[0]]:a:arguments.length==1?null:{}},set:function(){var a={};typeof arguments[0]=="string"&&arguments.length>=2?a[arguments[0]]=arguments[1]:a=arguments[0];Object.merge(this.getStoredHash(),a);this.navigateTo(this.getStoredHash())},unset:function(){arguments[0]=="all"?Object.each(this.getStoredHash(),function(a,b){delete c.storedHash[1].pathParsed[b]},this):Object.each(arguments,function(a){delete c.storedHash[1].pathParsed[a]},this);this.navigateTo(this.getStoredHash())},has:function(){if(arguments[0]==
"all")return!!Object.getLength(this.getStoredHash());var a=Object.filter(arguments,function(a){return a in this.getStoredHash()}.bind(this));return Object.getLength(arguments)==1?Object.getLength(a)==1?!0:!1:Object.values(a)},isNative:function(){return c["native"]},isLegalHash:function(a){a=a||this.getStoredHashData()[0];return a.substr(1,this.options.prefix.length)==this.options.prefix},triggerEvent:function(a){var b=this.getStoredHashData();return(a?a:b?b:!1)[0]?window.fireEvent("navchange",[this.getStoredHashData()]):
!1},$_hidden_pseudoprivate_getState:function(){return[c,j]},$_hidden_pseudoprivate_setState:function(a,b){c=a;j=b}})})();