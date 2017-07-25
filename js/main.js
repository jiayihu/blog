!function e(t,n,r){function o(a,u){if(!n[a]){if(!t[a]){var c="function"==typeof require&&require;if(!u&&c)return c(a,!0);if(i)return i(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var l=n[a]={exports:{}};t[a][0].call(l.exports,function(e){var n=t[a][1][e];return o(n||e)},l,l.exports,e,t,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(e,t,n){t.exports=e("./lib/reading-time")},{"./lib/reading-time":2}],2:[function(e,t,n){"use strict";var r=function(e){return" "==e||"\n"==e||"\r"==e||"\t"==e};t.exports=function(e,t){var n,o=0,i=0,a=e.length-1;for((t=t||{}).wordsPerMinute=t.wordsPerMinute||200,r=t.wordBound||r;r(e[i]);)i++;for(;r(e[a]);)a--;for(n=i;n<=a;){for(;n<=a&&!r(e[n]);n++);for(o++;n<=a&&r(e[n]);n++);}var u=o/t.wordsPerMinute,c=60*u*1e3;return{text:Math.ceil(u.toFixed(2))+" min read",minutes:u,time:c,words:o}}},{}],3:[function(e,t,n){!function(e,n){"object"==typeof t&&t.exports?(t.exports=n(),t.exports.default=t.exports):e.timeago=n()}("undefined"!=typeof window?window:this,function(){function e(e){return e instanceof Date?e:isNaN(e)?/^\d+$/.test(e)?new Date(t(e)):(e=(e||"").trim().replace(/\.\d+/,"").replace(/-/,"/").replace(/-/,"/").replace(/(\d)T(\d)/,"$1 $2").replace(/Z/," UTC").replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"),new Date(e)):new Date(t(e))}function t(e){return parseInt(e)}function n(e,n,r){n=d[n]?n:d[r]?r:"en";for(var o=0,i=e<0?1:0,a=e=Math.abs(e);e>=m[o]&&o<h;o++)e/=m[o];return e=t(e),o*=2,e>(0===o?9:1)&&(o+=1),d[n](e,o,a)[i].replace("%s",e)}function r(t,n){return((n=n?e(n):new Date)-e(t))/1e3}function o(e){for(var t=1,n=0,r=Math.abs(e);e>=m[n]&&n<h;n++)e/=m[n],t*=m[n];return r%=t,r=r?t-r:t,Math.ceil(r)}function i(e){return a(e,"data-timeago")||a(e,"datetime")}function a(e,t){return e.getAttribute?e.getAttribute(t):e.attr?e.attr(t):void 0}function u(e,t){return e.setAttribute?e.setAttribute(p,t):e.attr?e.attr(p,t):void 0}function c(e,t){this.nowDate=e,this.defaultLocale=t||"en"}function s(e,t){return new c(e,t)}var l="second_minute_hour_day_week_month_year".split("_"),f="秒_分钟_小时_天_周_月_年".split("_"),d={en:function(e,t){if(0===t)return["just now","right now"];var n=l[parseInt(t/2)];return e>1&&(n+="s"),[e+" "+n+" ago","in "+e+" "+n]},zh_CN:function(e,t){if(0===t)return["刚刚","片刻后"];var n=f[parseInt(t/2)];return[e+n+"前",e+n+"后"]}},m=[60,60,24,7,365/7/12,12],h=6,p="data-tid",v={};return c.prototype.doRender=function(e,t,i){var a,c=r(t,this.nowDate),s=this;e.innerHTML=n(c,i,this.defaultLocale),v[a=setTimeout(function(){s.doRender(e,t,i),delete v[a]},Math.min(1e3*o(c),2147483647))]=0,u(e,a)},c.prototype.format=function(e,t){return n(r(e,this.nowDate),t,this.defaultLocale)},c.prototype.render=function(e,t){void 0===e.length&&(e=[e]);for(var n=0,r=e.length;n<r;n++)this.doRender(e[n],i(e[n]),t)},c.prototype.setLocale=function(e){this.defaultLocale=e},s.register=function(e,t){d[e]=t},s.cancel=function(e){var t;if(e)(t=a(e,p))&&(clearTimeout(t),delete v[t]);else{for(t in v)clearTimeout(t);v={}}},s})},{}],4:[function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}var o=r(e("./modules/anchors")),i=r(e("./modules/comments")),a=r(e("./modules/reading-time"));document.body.classList.contains("page--article")&&((0,o.default)(),(0,a.default)(),(0,i.default)())},{"./modules/anchors":5,"./modules/comments":6,"./modules/reading-time":7}],5:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelectorAll(".article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6");Array.from(e).forEach(function(e){var t=e.id;e.innerHTML='<a href="#'+t+'" class="color-inherit f4 no-underline underline-hover" aria-hidden="true">#</a> '+e.innerHTML})}},{}],6:[function(e,t,n){"use strict";function r(e){return'\n    <li class="comment flex mt3">\n      <div class="comment__author mr2 tc">\n        <a href="'+e.user.html_url+'" class="dib h2--half w2--half">\n          <img src="'+e.user.avatar_url+'" alt="'+e.user.login+'" class="br2 h2--half w2--half dib" />\n        </a>\n      </div>\n      <div class="fg1 br2 ba b--moon-gray f6">\n        <div class="comment__header bb b--moon-gray bg-black-05 flex items-center silver ph3 pv2">\n          <span>\n            <a href="'+e.user.html_url+'" class="link underline-hover near-black">\n              '+e.user.login+'\n            </a>\n            commented\n            <a href="'+e.html_url+'" class="link underline-hover silver">\n              '+f.format(e.created_at)+"\n            </a>\n          </span>\n          "+("jiayihu"===e.user.login?'<span class="ba b--moon-gray br2 mla f7 fw7 ph2 pv1">Author</span>':"")+'\n        </div>\n        <div class="comment__body pa3">'+e.body_html+"</div>\n      </div>\n    </li>\n  "}function o(e){document.querySelector(".comments-content").innerHTML=e}function i(e){o('\n    <ul class="list pl0">\n      '+e.map(function(e){return r(e)}).join("")+"\n    </ul>\n  ")}function a(){o('\n    <p class="f6 tc">Be the first to comment.<p>\n  ')}function u(){o('\n  <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">\n    <span class="lh-title ml3">Comments are not available yet for this article.</span>\n  </div>\n  ')}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){fetch(s,{headers:{Accept:"application/vnd.github.v3.html+json",Authorization:"token "+l,"Content-Type":"tapplicationext/json"},mode:"cors"}).then(function(e){return e.json()}).then(function(e){e.length?i(e):a()}).catch(function(e){console.error(e),u()})};var c=function(e){return e&&e.__esModule?e:{default:e}}(e("timeago.js")),s="https://api.github.com/repos/jiayihu/blog/issues/"+window.ISSUE_ID+"/comments",l="f6246fe0a4fe00f2c3ed6ca5d922905a84094d1a",f=(0,c.default)()},{"timeago.js":3}],7:[function(e,t,n){"use strict";function r(e){var t=document.querySelector(".article-meta"),n=document.createElement("span");n.classList.add("i","f5"),n.textContent=" - "+e,t.appendChild(n)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){var e=document.querySelector(".article-content").innerHTML.replace(/<(?:.|\n)*?>/gm,"");r((0,o.default)(e).text)};var o=function(e){return e&&e.__esModule?e:{default:e}}(e("reading-time"))},{"reading-time":1}]},{},[4]);