!function i(a,s,u){function c(t,e){if(!s[t]){if(!a[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(d)return d(t,!0);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[t]={exports:{}};a[t][0].call(o.exports,function(e){return c(a[t][1][e]||e)},o,o.exports,i,a,s,u)}return s[t].exports}for(var d="function"==typeof require&&require,e=0;e<u.length;e++)c(u[e]);return c}({1:[function(e,t,n){var r,o;r=this,o=function(){"use strict";var s="undefined"!=typeof document&&document.documentMode,l={rootMargin:"0px",threshold:0,load:function(e){if("picture"===e.nodeName.toLowerCase()){var t=document.createElement("img");s&&e.getAttribute("data-iesrc")&&(t.src=e.getAttribute("data-iesrc")),e.getAttribute("data-alt")&&(t.alt=e.getAttribute("data-alt")),e.append(t)}if("video"===e.nodeName.toLowerCase()&&!e.getAttribute("data-src")&&e.children){for(var n=e.children,r=void 0,o=0;o<=n.length-1;o++)(r=n[o].getAttribute("data-src"))&&(n[o].src=r);e.load()}if(e.getAttribute("data-src")&&(e.src=e.getAttribute("data-src")),e.getAttribute("data-srcset")&&e.setAttribute("srcset",e.getAttribute("data-srcset")),e.getAttribute("data-background-image"))e.style.backgroundImage="url('"+e.getAttribute("data-background-image").split(",").join("'),url('")+"')";else if(e.getAttribute("data-background-image-set")){var i=e.getAttribute("data-background-image-set").split(","),a=i[0].substr(0,i[0].indexOf(" "))||i[0];a=-1===a.indexOf("url(")?"url("+a+")":a,1===i.length?e.style.backgroundImage=a:e.setAttribute("style",(e.getAttribute("style")||"")+"background-image: "+a+"; background-image: -webkit-image-set("+i+"); background-image: image-set("+i+")")}e.getAttribute("data-toggle-class")&&e.classList.toggle(e.getAttribute("data-toggle-class"))},loaded:function(){}};function f(e){e.setAttribute("data-loaded",!0)}function g(e){return"true"===e.getAttribute("data-loaded")}return function(){var n,r,o=0<arguments.length&&void 0!==arguments[0]?arguments[0]:".lozad",e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},t=Object.assign({},l,e),i=t.root,a=t.rootMargin,s=t.threshold,u=t.load,c=t.loaded,d=void 0;return"undefined"!=typeof window&&window.IntersectionObserver&&(d=new IntersectionObserver((n=u,r=c,function(e,t){e.forEach(function(e){(0<e.intersectionRatio||e.isIntersecting)&&(t.unobserve(e.target),g(e.target)||(n(e.target),f(e.target),r(e.target)))})}),{root:i,rootMargin:a,threshold:s})),{observe:function(){for(var e=function(e,t){var n=1<arguments.length&&void 0!==t?t:document;return e instanceof Element?[e]:e instanceof NodeList?e:n.querySelectorAll(e)}(o,i),t=0;t<e.length;t++)g(e[t])||(d?d.observe(e[t]):(u(e[t]),f(e[t]),c(e[t])))},triggerLoad:function(e){g(e)||(u(e),f(e),c(e))},observer:d}}},"object"==typeof n&&void 0!==t?t.exports=o():"function"==typeof define&&define.amd?define(o):(r=r||self).lozad=o()},{}],2:[function(e,t,n){t.exports=e("./lib/reading-time")},{"./lib/reading-time":3}],3:[function(e,t,n){"use strict";function c(e){return" "===e||"\n"===e||"\r"===e||"\t"===e}t.exports=function(e,t){var n,r,o=0,i=0,a=e.length-1;for((t=t||{}).wordsPerMinute=t.wordsPerMinute||200,n=t.wordBound||c;n(e[i]);)i++;for(;n(e[a]);)a--;for(r=i;r<=a;){for(;r<=a&&!n(e[r]);r++);for(o++;r<=a&&n(e[r]);r++);}var s=o/t.wordsPerMinute,u=60*s*1e3;return{text:Math.ceil(s.toFixed(2))+" min read",minutes:s,time:u,words:o}}},{}],4:[function(e,t,n){var r,o;r="undefined"!=typeof window?window:this,o=function(){function n(e){return e instanceof Date?e:isNaN(e)?/^\d+$/.test(e)?new Date(a(e)):(e=(e||"").trim().replace(/\.\d+/,"").replace(/-/,"/").replace(/-/,"/").replace(/(\d)T(\d)/,"$1 $2").replace(/Z/," UTC").replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"),new Date(e)):new Date(a(e))}function a(e){return parseInt(e)}function s(e,t,n){t=d[t]?t:d[n]?n:"en";for(var r=0,o=e<0?1:0,i=e=Math.abs(e);l[r]<=e&&r<6;r++)e/=l[r];return(0===(r*=2)?9:1)<(e=a(e))&&(r+=1),d[t](e,r,i)[o].replace("%s",e)}function u(e,t){return((t=t?n(t):new Date)-n(e))/1e3}function i(e,t){return e.getAttribute?e.getAttribute(t):e.attr?e.attr(t):void 0}function r(e,t){this.nowDate=e,this.defaultLocale=t||"en"}function e(e,t){return new r(e,t)}var o="second_minute_hour_day_week_month_year".split("_"),c="秒_分钟_小时_天_周_月_年".split("_"),d={en:function(e,t){if(0===t)return["just now","right now"];var n=o[parseInt(t/2)];return 1<e&&(n+="s"),[e+" "+n+" ago","in "+e+" "+n]},zh_CN:function(e,t){if(0===t)return["刚刚","片刻后"];var n=c[parseInt(t/2)];return[e+n+"前",e+n+"后"]}},l=[60,60,24,7,365/7/12,12],f="data-tid",g={};return r.prototype.doRender=function(e,t,n){var r,o=u(t,this.nowDate),i=this;e.innerHTML=s(o,n,this.defaultLocale),g[r=setTimeout(function(){i.doRender(e,t,n),delete g[r]},Math.min(1e3*function(e){for(var t=1,n=0,r=Math.abs(e);l[n]<=e&&n<6;n++)e/=l[n],t*=l[n];return r=(r%=t)?t-r:t,Math.ceil(r)}(o),2147483647))]=0,function(e,t){e.setAttribute?e.setAttribute(f,t):e.attr&&e.attr(f,t)}(e,r)},r.prototype.format=function(e,t){return s(u(e,this.nowDate),t,this.defaultLocale)},r.prototype.render=function(e,t){void 0===e.length&&(e=[e]);for(var n=0,r=e.length;n<r;n++)this.doRender(e[n],i(o=e[n],"data-timeago")||i(o,"datetime"),t);var o},r.prototype.setLocale=function(e){this.defaultLocale=e},e.register=function(e,t){d[e]=t},e.cancel=function(e){var t;if(e)(t=i(e,f))&&(clearTimeout(t),delete g[t]);else{for(t in g)clearTimeout(t);g={}}},e},"object"==typeof t&&t.exports?(t.exports=o(),t.exports.default=t.exports):r.timeago=o()},{}],5:[function(e,t,n){"use strict";var r=s(e("lozad")),o=s(e("./modules/anchors")),i=s(e("./modules/comments")),a=s(e("./modules/reading-time"));function s(e){return e&&e.__esModule?e:{default:e}}var u=document.body.classList.contains("page--article"),c=window.fetch;u&&c&&((0,r.default)().observe(),(0,o.default)(),(0,a.default)(),(0,i.default)());"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").then(function(e){console.log("[ServiceWorker] registered"),e.addEventListener("updatefound",function(){console.log("[ServiceWorker] update found")})}).catch(function(e){return console.log("[ServiceWorker] registration failed: ",e)}),navigator.serviceWorker.controller&&navigator.serviceWorker.controller.postMessage({type:"TRIM_CACHE"})})},{"./modules/anchors":6,"./modules/comments":7,"./modules/reading-time":9,lozad:1}],6:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelectorAll(".article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6");Array.from(e).forEach(function(e){var t=e.id;e.innerHTML='<a href="#'+t+'" class="color-inherit f4 no-underline underline-hover" aria-hidden="true">#</a> '+e.innerHTML})}},{}],7:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){if(!window.ISSUE_ID)return u('\n    <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">\n      <span class="lh-title ml3">Comments are not shown yet for this article.</span>\n    </div>\n  ');var e="https://api.github.com/repos/jiayihu/blog/issues/"+window.ISSUE_ID+"/comments",t=(0,o.default)("64393166653530663931373937663339343234646338623031366632656139643132366633633134");fetch(e,{headers:{Accept:"application/vnd.github.v3.html+json",Authorization:"token "+t,"Content-Type":"application/json"},mode:"cors"}).then(function(e){return e.ok?e.json():Promise.reject(e.statusText)}).then(c).catch(function(e){console.error(e),u('\n    <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">\n      <span class="lh-title ml3">Comments are not shown yet for this article.</span>\n    </div>\n  ')}),"caches"in window&&caches.match(e).then(function(e){e&&e.json().then(c)})};var r=i(e("timeago.js")),o=i(e("./hex"));function i(e){return e&&e.__esModule?e:{default:e}}var a=(0,r.default)();function s(e){return'\n    <ul class="list pl0">\n      '+e.map(function(e){return function(e){return'\n    <li class="comment flex mt3">\n      <div class="comment__author mr2 tc">\n        <a href="'+e.user.html_url+'" class="dib h2--half w2--half">\n          <img\n            src="'+e.user.avatar_url+'"\n            alt="'+e.user.login+'"\n            class="br2 h2--half w2--half dib"\n          />\n        </a>\n      </div>\n      <div class="fg1 br2 ba b--moon-gray f6">\n        <div class="comment__header bb b--moon-gray flex items-center silver ph3 pv2">\n          <span>\n            <a href="'+e.user.html_url+'" class="fw7 link mid-gray underline-hover">\n              '+e.user.login+'\n            </a>\n            commented\n            <a href="'+e.html_url+'" class="link underline-hover silver">\n              '+a.format(e.created_at)+"\n            </a>\n          </span>\n          "+("jiayihu"===e.user.login?'<span class="ba b--moon-gray br2 mla f7 fw7 ph2 pv1">Author</span>':"")+'\n        </div>\n        <div class="comment__body ph3">'+e.body_html+"</div>\n      </div>\n    </li>\n  "}(e)}).join("")+"\n    </ul>\n  "}function u(e){document.querySelector(".comments-content").innerHTML=e}function c(e){e.length?u(s(e)):u('\n    <p class="f6 tc">Be the first to comment.<p>\n  ')}},{"./hex":8,"timeago.js":4}],8:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){for(var t=e.toString(),n="",r=0;r<t.length;r+=2)n+=String.fromCharCode(parseInt(t.substr(r,2),16));return n}},{}],9:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelector(".article-content").innerHTML.replace(/<(?:.|\n)*?>/gm,"");!function(e){var t=document.querySelector(".article-meta"),n=document.createElement("span");n.classList.add("i","f5"),n.textContent=" - "+e,t.appendChild(n)}((0,i.default)(e).text)};var r,o=e("reading-time"),i=(r=o)&&r.__esModule?r:{default:r}},{"reading-time":2}]},{},[5]);