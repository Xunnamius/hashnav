(function(){HashNav.implement({$_hidden_wlogic_loaded:!0,$_hidden_wlogic_optimize:function(a){var b=a.params["*"];if(typeof b=="boolean")delete a.params["*"],Object.contains(a.params,b)||(a.params["*"]=b);else if(b==="~"){if(a.params={"*":"~"},a.qualifiers)a.qualifiers.explicitChange?a.qualifiers={explicitChange:!0}:delete a.qualifiers}else b===""?Object.getLength(Object.filter(a.params,function(a){return a!=="~"}))-1&&delete a.params["*"]:(a.qualifiers&&a.qualifiers.exclusive&&delete a.qualifiers.exclusive,
a.params={"*":b});return a}.protect(),$_hidden_wlogic_scan:function(a,b){var d=!1,c=a.params["*"];if(c==="~"){if(!b.path||Object.getLength(b.path)==0)d=b.satisfied=!0}else if(Object.getLength(b.path)){delete a.params["*"];if(c==="")d=a.qualifiers&&a.qualifiers.exclusive&&Object.getLength(b.path)!=Object.getLength(Object.filter(a.params,function(a){return a!="~"}))?!1:b.satisfied=!0;else if(c===!0&&Object.contains(b.path,!0)||c===!1&&Object.contains(b.path,this.options.makeFalse?!1:"")||Object.values(b.path).every(function(a){d=
b.wildstrict?a===c:a.toString()==c.toString()}))d=!0;a.params["*"]=c}return[a,b,d]}.protect()})})();