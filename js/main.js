!function e(t,n,r){function o(a,u){if(!n[a]){if(!t[a]){var c="function"==typeof require&&require;if(!u&&c)return c(a,!0);if(i)return i(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var d=n[a]={exports:{}};t[a][0].call(d.exports,function(e){var n=t[a][1][e];return o(n||e)},d,d.exports,e,t,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(e,t,n){!function(e,r){"object"==typeof n&&void 0!==t?t.exports=r():"function"==typeof define&&define.amd?define(r):e.lozad=r()}(this,function(){"use strict";function e(e){e.setAttribute("data-loaded",!0)}var t=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},n=document.documentMode,r={rootMargin:"0px",threshold:0,load:function(e){if("picture"===e.nodeName.toLowerCase()){var t=document.createElement("img");n&&e.getAttribute("data-iesrc")&&(t.src=e.getAttribute("data-iesrc")),e.appendChild(t)}e.getAttribute("data-src")&&(e.src=e.getAttribute("data-src")),e.getAttribute("data-srcset")&&(e.srcset=e.getAttribute("data-srcset")),e.getAttribute("data-background-image")&&(e.style.backgroundImage="url('"+e.getAttribute("data-background-image")+"')")},loaded:function(){}},o=function(e){return"true"===e.getAttribute("data-loaded")},i=function(t,n){return function(r,i){r.forEach(function(r){r.intersectionRatio>0&&(i.unobserve(r.target),o(r.target)||(t(r.target),e(r.target),n(r.target)))})}},a=function(e){return e instanceof Element?[e]:e instanceof NodeList?e:document.querySelectorAll(e)};return function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:".lozad",u=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},c=t({},r,u),s=c.rootMargin,d=c.threshold,l=c.load,f=c.loaded,h=void 0;return window.IntersectionObserver&&(h=new IntersectionObserver(i(l,f),{rootMargin:s,threshold:d})),{observe:function(){for(var t=a(n),r=0;r<t.length;r++)o(t[r])||(h?h.observe(t[r]):(l(t[r]),e(t[r]),f(t[r])))},triggerLoad:function(t){o(t)||(l(t),e(t),f(t))}}}})},{}],2:[function(e,t,n){t.exports=e("./lib/reading-time")},{"./lib/reading-time":3}],3:[function(e,t,n){"use strict";var r=function(e){return" "==e||"\n"==e||"\r"==e||"\t"==e};t.exports=function(e,t){var n,o=0,i=0,a=e.length-1;for((t=t||{}).wordsPerMinute=t.wordsPerMinute||200,r=t.wordBound||r;r(e[i]);)i++;for(;r(e[a]);)a--;for(n=i;n<=a;){for(;n<=a&&!r(e[n]);n++);for(o++;n<=a&&r(e[n]);n++);}var u=o/t.wordsPerMinute,c=60*u*1e3;return{text:Math.ceil(u.toFixed(2))+" min read",minutes:u,time:c,words:o}}},{}],4:[function(e,t,n){!function(e,n){"object"==typeof t&&t.exports?(t.exports=n(),t.exports.default=t.exports):e.timeago=n()}("undefined"!=typeof window?window:this,function(){function e(e){return e instanceof Date?e:isNaN(e)?/^\d+$/.test(e)?new Date(t(e)):(e=(e||"").trim().replace(/\.\d+/,"").replace(/-/,"/").replace(/-/,"/").replace(/(\d)T(\d)/,"$1 $2").replace(/Z/," UTC").replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"),new Date(e)):new Date(t(e))}function t(e){return parseInt(e)}function n(e,n,r){n=f[n]?n:f[r]?r:"en";for(var o=0,i=e<0?1:0,a=e=Math.abs(e);e>=h[o]&&o<m;o++)e/=h[o];return e=t(e),o*=2,e>(0===o?9:1)&&(o+=1),f[n](e,o,a)[i].replace("%s",e)}function r(t,n){return((n=n?e(n):new Date)-e(t))/1e3}function o(e){for(var t=1,n=0,r=Math.abs(e);e>=h[n]&&n<m;n++)e/=h[n],t*=h[n];return r%=t,r=r?t-r:t,Math.ceil(r)}function i(e){return a(e,"data-timeago")||a(e,"datetime")}function a(e,t){return e.getAttribute?e.getAttribute(t):e.attr?e.attr(t):void 0}function u(e,t){return e.setAttribute?e.setAttribute(p,t):e.attr?e.attr(p,t):void 0}function c(e,t){this.nowDate=e,this.defaultLocale=t||"en"}function s(e,t){return new c(e,t)}var d="second_minute_hour_day_week_month_year".split("_"),l="秒_分钟_小时_天_周_月_年".split("_"),f={en:function(e,t){if(0===t)return["just now","right now"];var n=d[parseInt(t/2)];return e>1&&(n+="s"),[e+" "+n+" ago","in "+e+" "+n]},zh_CN:function(e,t){if(0===t)return["刚刚","片刻后"];var n=l[parseInt(t/2)];return[e+n+"前",e+n+"后"]}},h=[60,60,24,7,365/7/12,12],m=6,p="data-tid",g={};return c.prototype.doRender=function(e,t,i){var a,c=r(t,this.nowDate),s=this;e.innerHTML=n(c,i,this.defaultLocale),g[a=setTimeout(function(){s.doRender(e,t,i),delete g[a]},Math.min(1e3*o(c),2147483647))]=0,u(e,a)},c.prototype.format=function(e,t){return n(r(e,this.nowDate),t,this.defaultLocale)},c.prototype.render=function(e,t){void 0===e.length&&(e=[e]);for(var n=0,r=e.length;n<r;n++)this.doRender(e[n],i(e[n]),t)},c.prototype.setLocale=function(e){this.defaultLocale=e},s.register=function(e,t){f[e]=t},s.cancel=function(e){var t;if(e)(t=a(e,p))&&(clearTimeout(t),delete g[t]);else{for(t in g)clearTimeout(t);g={}}},s})},{}],5:[function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}var o=r(e("lozad")),i=r(e("./modules/anchors")),a=r(e("./modules/comments")),u=r(e("./modules/reading-time")),c=document.body.classList.contains("page--article"),s=window.fetch;c&&s&&((0,o.default)().observe(),(0,i.default)(),(0,u.default)(),(0,a.default)()),"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").then(function(e){console.log("[ServiceWorker] registered")},function(e){console.log("[ServiceWorker] registration failed: ",e)})})},{"./modules/anchors":6,"./modules/comments":7,"./modules/reading-time":9,lozad:1}],6:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelectorAll(".article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6");Array.from(e).forEach(function(e){var t=e.id;e.innerHTML='<a href="#'+t+'" class="color-inherit f4 no-underline underline-hover" aria-hidden="true">#</a> '+e.innerHTML})}},{}],7:[function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e){return'\n    <li class="comment flex mt3">\n      <div class="comment__author mr2 tc">\n        <a href="'+e.user.html_url+'" class="dib h2--half w2--half">\n          <img src="'+e.user.avatar_url+'" alt="'+e.user.login+'" class="br2 h2--half w2--half dib" />\n        </a>\n      </div>\n      <div class="fg1 br2 ba b--moon-gray f6">\n        <div class="comment__header bb b--moon-gray bg-black-05 flex items-center silver ph3 pv2">\n          <span>\n            <a href="'+e.user.html_url+'" class="link underline-hover near-black">\n              '+e.user.login+'\n            </a>\n            commented\n            <a href="'+e.html_url+'" class="link underline-hover silver">\n              '+f.format(e.created_at)+"\n            </a>\n          </span>\n          "+("jiayihu"===e.user.login?'<span class="ba b--moon-gray br2 mla f7 fw7 ph2 pv1">Author</span>':"")+'\n        </div>\n        <div class="comment__body pa3">'+e.body_html+"</div>\n      </div>\n    </li>\n  "}function i(e){return'\n    <ul class="list pl0">\n      '+e.map(function(e){return o(e)}).join("")+"\n    </ul>\n  "}function a(){return'\n    <p class="f6 tc">Be the first to comment.<p>\n  '}function u(){return'\n    <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">\n      <span class="lh-title ml3">Comments are not shown yet for this article.</span>\n    </div>\n  '}function c(e){document.querySelector(".comments-content").innerHTML=e}function s(e){c(e.length?i(e):a())}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){if(!window.ISSUE_ID)return c(u());var e="https://api.github.com/repos/jiayihu/blog/issues/"+window.ISSUE_ID+"/comments",t=(0,l.default)("39326663663064373731313134356663373530653162336133613131643339383031313934383030");fetch(e,{headers:{Accept:"application/vnd.github.v3.html+json",Authorization:"token "+t,"Content-Type":"application/json"},mode:"cors"}).then(function(e){return e.ok?e.json():Promise.reject(e.statusText)}).then(s).catch(function(e){console.error(e),c(u())}),"caches"in window&&caches.match(e).then(function(e){e&&e.json().then(s)})};var d=r(e("timeago.js")),l=r(e("./hex")),f=(0,d.default)()},{"./hex":8,"timeago.js":4}],8:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){for(var t=e.toString(),n="",r=0;r<t.length;r+=2)n+=String.fromCharCode(parseInt(t.substr(r,2),16));return n}},{}],9:[function(e,t,n){"use strict";function r(e){var t=document.querySelector(".article-meta"),n=document.createElement("span");n.classList.add("i","f5"),n.textContent=" - "+e,t.appendChild(n)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelector(".article-content").innerHTML.replace(/<(?:.|\n)*?>/gm,"");r((0,o.default)(e).text)};var o=function(e){return e&&e.__esModule?e:{default:e}}(e("reading-time"))},{"reading-time":2}]},{},[5]);