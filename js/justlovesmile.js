"use strict";

function _typeof(t) {
	return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t
}

:function(t) {
	return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol": typeof t
})(t)
}

function show_runtime() {
if(null==document.getElementById("webtime"))return!1;window.setTimeout("show_runtime()",1e3);var t=new Date("7/10/2019 23:59:59"),e=((new Date).getTime()-t.getTime())/864e5,i=Math.floor(e),o=24*(e-i),n=Math.floor(o),r=60*(o-n),a=Math.floor(60*(o-n)),s=Math.floor(60*(r-a));document.getElementById("webtime").innerHTML="已运行: "+i+"天"+n+"小时"+a+"分"+s+"秒"
}

var colortap=function(i) {
function o(t){for(var e=document.createDocumentFragment(),i=0;i<t;i++){var o=document.createElement("span");o.textContent=String.fromCharCode(94*Math.random()+33),o.style.color=d[Math.floor(Math.random()*d.length)],e.appendChild(o)
}

return e
}

var n="",r=["醒亦念卿，梦亦念卿","频繁记录，只因生活和你太值得","孜孜不倦，认真且怂"].map(function(t) {
return t+""
}),a=2,s=1,c=5,l=75,d=["rgb(110,64,170)","rgb(150,61,179)","rgb(191,60,175)","rgb(228,65,157)","rgb(254,75,131)","rgb(255,94,99)","rgb(255,120,71)","rgb(251,150,51)","rgb(226,183,47)","rgb(198,214,60)","rgb(175,240,91)","rgb(127,246,88)","rgb(82,246,103)","rgb(48,239,130)","rgb(29,223,163)","rgb(26,199,194)","rgb(35,171,216)","rgb(54,140,225)","rgb(76,110,219)","rgb(96,84,200)"],h= {
text: "",prefixP:-c,skillI:0,skillP:0,direction:"forward",delay:a,step:s
};!function t() {
var e=r[h.skillI];h.step?h.step--: (h.step=s,h.prefixP<n.length?(0<=h.prefixP&&(h.text+=n[h.prefixP]),h.prefixP++):"forward"===h.direction?h.skillP<e.length?(h.text+=e[h.skillP],h.skillP++):h.delay?h.delay--:(h.direction="backward",h.delay=a):0<h.skillP?(h.text=h.text.slice(0,-1),h.skillP--):(h.skillI=(h.skillI+1)%r.length,h.direction="forward")),i.textContent=h.text,i.appendChild(o(h.prefixP<n.length?Math.min(c,c+h.prefixP):Math.min(c,e.length-h.skillP))),setTimeout(t,l)
}()};

function unmouse() {
document.onkeydown=document.onkeyup=document.onkeypress=function(t){var e=t||window.event||arguments.callee.caller.arguments[0];if(e&&(123==e.keyCode||116==e.keyCode&&"keypress"!=e.type))return e.returnValue=!1
}}

function dark() {
window.requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;var o,n,e,r,t=.05,i=document.getElementById("universe"),a=!0,s="180,184,240",c="226,225,142",l="226,225,224",d=[];function h(){o=window.innerWidth,n=window.innerHeight,e=.216*o,i.setAttribute("width",o),i.setAttribute("height",n)
}

function u() {
r.clearRect(0,0,o,n);for(var t=d.length,e=0;e<t;e++){var i=d[e];i.move(),i.fadeIn(),i.fadeOut(),i.draw()
}}

function m() {
this.reset=function(){this.giant=y(3),this.comet=!this.giant&&!a&&y(10),this.x=g(0,o-10),this.y=g(0,n),this.r=g(1.1,2.6),this.dx=g(t,6*t)+(this.comet+1-1)*t*g(50,120)+2*t,this.dy=-g(t,6*t)-(this.comet+1-1)*t*g(50,120),this.fadingOut=null,this.fadingIn=!0,this.opacity=0,this.opacityTresh=g(.2,1-.4*(this.comet+1-1)),this.do=g(5e-4,.002)+.001*(this.comet+1-1)
},this.fadeIn=function() {
this.fadingIn&&(this.fadingIn=!(this.opacity>this.opacityTresh),this.opacity+=this.do)
},this.fadeOut=function() {
this.fadingOut&&(this.fadingOut=!(this.opacity<0),this.opacity-=this.do/2,(this.x>o||this.y<0)&&(this.fadingOut=!1,this.reset()))
},this.draw=function() {
if(r.beginPath(),this.giant)r.fillStyle="rgba("+s+","+this.opacity+")",r.arc(this.x,this.y,2,0,2*Math.PI,!1);else if(this.comet){r.fillStyle="rgba("+l+","+this.opacity+")",r.arc(this.x,this.y,1.5,0,2*Math.PI,!1);for(var t=0;t<30;t++)r.fillStyle="rgba("+l+","+(this.opacity-this.opacity/20*t)+")",r.rect(this.x-this.dx/4*t,this.y-this.dy/4*t-2,2,2),r.fill()
}

else r.fillStyle="rgba("+c+","+this.opacity+")",r.rect(this.x,this.y,this.r,this.r);r.closePath(),r.fill()
},this.move=function() {
this.x+=this.dx,this.y+=this.dy,!1===this.fadingOut&&this.reset(),(this.x>o-o/4||this.y<0)&&(this.fadingOut=!0)
},setTimeout(function() {
a=!1
},50)
}

function y(t) {
return Math.floor(1e3*Math.random())+1<10*t
}

function g(t,e) {
return Math.random()*(e-t)+t
}

h(),window.addEventListener("resize",h,!1),function() {
r=i.getContext("2d");for(var t=0;t<e;t++)d[t]=new m,d[t].reset();u()
}(),function t() {
"dark"
==document.getElementsByTagName("html")[0].getAttribute("data-theme")&&u(),window.requestAnimationFrame(t)
}()}

function switchDarkMode() {
"light"
==("dark"===document.documentElement.getAttribute("data-theme")?"dark": "light")?(activateDarkMode(),saveToLocal.set("theme","dark",2),void 0!==GLOBAL_CONFIG.Snackbar&&btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)):(activateLightMode(),saveToLocal.set("theme","light",2),void 0!==GLOBAL_CONFIG.Snackbar&&btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)),"function"==typeof utterancesTheme&&utterancesTheme(),"object"===("undefined"==typeof FB?"undefined":_typeof(FB))&&window.loadFBComment(),window.DISQUS&&document.getElementById("disqus_thread").children.length&&setTimeout(function(){return window.disqusReset()
},200)
}

function scrollToTop() {
btf.scrollToDest(0,500)
}

function switchPostChart() {
var t,e,i,o="light"===document.documentElement.getAttribute("data-theme")?"#4c4948": "rgba(255,255,255,0.7)";
document.getElementById("posts-chart")&&((t=postsOption).textStyle.color=o,t.title.textStyle.color=o,t.xAxis.axisLine.lineStyle.color=o,t.yAxis.axisLine.lineStyle.color=o,postsChart.setOption(t)),document.getElementById("tags-chart")&&((e=tagsOption).textStyle.color=o,e.title.textStyle.color=o,e.xAxis.axisLine.lineStyle.color=o,e.yAxis.axisLine.lineStyle.color=o,tagsChart.setOption(e)),document.getElementById("categories-chart")&&((i=categoriesOption).textStyle.color=o,i.title.textStyle.color=o,i.legend.textStyle.color=o,categoriesChart.setOption(i))
}

function switchVisitChart() {
var t,e,i,o="light"===document.documentElement.getAttribute("data-theme")?"#4c4948": "rgba(255,255,255,0.7)";
document.getElementById("map-chart")&&((t=mapOption).title.textStyle.color=o,t.visualMap.textStyle.color=o,mapChart.setOption(t)),document.getElementById("trends-chart")&&((e=trendsOption).title.textStyle.color=o,e.xAxis.axisLine.lineStyle.color=o,e.yAxis.axisLine.lineStyle.color=o,e.textStyle.color=o,trendsChart.setOption(e)),document.getElementById("sources-chart")&&((i=sourcesOption).title.textStyle.color=o,i.legend.textStyle.color=o,i.textStyle.color=o,sourcesChart.setOption(i))
}

function categoriesBarActive() {
var t,e=window.location.pathname;"/"==(e=decodeURIComponent(e))?document.querySelector("#category-bar")&&document.getElementById("首页").classList.add("select"): /\/categories\/.*?\//.test(e)&&(t=e.split("/")[2],document.querySelector("#category-bar")&&document.getElementById(t).classList.add("select"))
}

function tagsBarActive() {
var t,e=window.location.pathname;"/"==(e=decodeURIComponent(e))?document.querySelector("#tags-bar")&&document.getElementById("首页").classList.add("select"): /\/tags\/.*?\//.test(e)&&(t=e.split("/")[2],document.querySelector("#category-bar")&&document.getElementById(t).classList.add("select"))
}

function topCategoriesBarScroll() {
var i;document.getElementById("category-bar-items")&&(i=document.getElementById("category-bar-items")).addEventListener("mousewheel",function(t){var e=-t.wheelDelta/2;i.scrollLeft+=e,t.preventDefault()
},!1)
}

dark(),document.getElementById("darkmode_navswitch").addEventListener("click",function() {
setTimeout(switchPostChart,100),setTimeout(switchVisitChart,100)
}),categoriesBarActive(),tagsBarActive(),topCategoriesBarScroll();