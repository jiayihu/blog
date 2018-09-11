---
title: What I've learnt reading Jason Miller's source code
subtitle: A tour of useful JavaScript tricks from his minimal open-source projects
date: 2018-06-24
layout: article.html
cover: /images/jason-miller/cover.jpg
coverColor: \#ffffff
---

Jason Miller is the author of [Preact](https://github.com/developit/preact) and he delivers a lot of high-quality small packages like Preact itself. I wanted then to read his source code for some time since I'm a fan of minimal implementations myself.

Reading his repos is very instructive, for they deal with problems of different nature (DOM, polyfill, bundling etc.) and the source code is minimal enough to be easily comprehensible. When you read a package like [React](https://github.com/facebook/react) (*) there's so much code which covers only edge cases, but it frightens you from adventuring in.
Besides, when you maintain a minimal lightweight implementation of something, your code aims to be balanced in terms of performance, readability and brevity. Not all the real-world use cases are covered, but that's perfect for learning.

Before carrying on, I must mention that not all the following code is necessary from Jason Miller, could surely be from some awesome contributor of his repos.

## Warning ⚠️

The following snippets are not meant to be shown as examples of best practices. They are just pieces of code which I found interesting and my explanation could also be different from the original thought by Miller.

Also, many snippets are changed a bit from the original source code to focus on the meaning.

# Microbundle 📦 

[microbundle](https://github.com/developit/microbundle) is a bundler, like Rollup (which is used under-the-hood), for tiny modules and without configuration.

## Array.prototype.concat

We start from this first curious snippet of the package:

```javascript
// source: https://github.com/developit/microbundle/blob/bf2d068dc646fcce976456359ee9c4689b74bea6/src/index.js#L93
[]
  .concat(
    options.entries && options.entries.length
      ? options.entries // string[]
      : options.pkg.source || options.pkg.module, // string
  )
  .map(file => glob(file))
  .forEach(options.input.push(...file));
```

Starting an expression with `[].concat()` is not very common, but it takes advantages on `Array.prototype.concat` which can accept both arrays and single values. I would have written the same code as follows:

```javascript
const input = options.entries && options.entries.length
      ? options.entries
      : [options.pkg.source || options.pkg.module];

input
  .map(file => glob(file))
  .forEach(options.input.push(...file));
```

I think it's more readable but it takes one more variable, which won't be used anymore and maybe it would make the reader wondering "Where else will it be referenced?". Also my solution cannot be used as expression, such as in `{ input: expression }` whereas you can do `{ input: [].concat(...) }`.

## .filter(Boolean)
 
I already knew the trick `array.filter(Boolean)` to remove not truthy values, but this is the next level of it. You can use it to **add optional values in an array using a single expression**:

```js
// Source: https://github.com/developit/microbundle/blob/bf2d068dc646fcce976456359ee9c4689b74bea6/src/index.js#L300
{
  plugins: []
    .concat(
      'postcss',
      useTypescript && 'typescript',
      !useTypescript && 'flow',
      'nodent',
      options.compress !== false && ['uglify', 'anotherPlugin']
    )
    .filter(Boolean)
}
```

If `useTypescript === false` and `options.compress !== false`, then the result will be

```js
[]
  .concat(
    ['postcss', false, 'flow', 'nodent', ['uglify', 'anotherPlugin']]
  )
  .filter(Boolean);
// Returns ['postcss', 'flow', 'nodent', 'uglify', 'anotherPlugin']
```

## Unique values

```javascript
// Source: https://github.com/developit/microbundle/blob/bf2d068dc646fcce976456359ee9c4689b74bea6/src/index.js#L117

entries.filter((item, i, arr) => arr.indexOf(item) === i)
```

It gets an **array of unique values** by cleverly removing duplicate items, which will have `arr.indexOf(item)` returning a smaller index. I usually use another solution based on [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), which stores unique values by definition, but this one from `microbundle` is a nice ES5 alternative.

```js
const unique = Array.from(new Set(entries));
```

# Workerize 🏗️

[workerize](https://github.com/developit/workerize) allows to run then code, passed as a string, in a **Web Worker**. Example from the doc:

```js
let worker = workerize(`
	export function add(a, b) {
		let start = Date.now();
		while (Date.now() - start < 500);
		return a + b;
	}
`);

(async () => {
	console.log('3 + 9 = ', await worker.add(3, 9));
	console.log('1 + 2 = ', await worker.add(1, 2));
})();
```

## Blob URL Worker

The source code of the package is about 70 LOC and for me the most interesting lines are the following:

```js
// Source: https://github.com/developit/workerize/blob/683631f402443d71484b03d087b37c72e65f2e3d/src/index.js#L25

const code = `export function add(a, b) { ... }`;
const url = URL.createObjectURL(new Blob([code]));
const worker = new Worker(url, options);
```

Basically, it **allows to create a Web Worker without any separate JS file**, by passing a String URL which represents a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), which in turn is a file-like object containing the source code. Try the following snippet in Chrome console to see it working:

```js
const url = URL.createObjectURL(new Blob(['postMessage("Hi from the Worker")']))
const worker = new Worker(url);
worker.onmessage = e => console.log(e.data);
```

# Greenlet 🦎

[greelet](https://github.com/developit/greenlet) is like `workerize` but for single functions.

## Data URL Worker

In the previous case, we have seen how a Web Worker can be created using just a Blob URL, but this package shows that you can achieve the same result also using [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs):

```js
// Source: https://github.com/developit/greenlet/blob/d4d3f0d903ef34df69443f6f86a81d0fa6035c56/greenlet.js#L15
const worker = new Worker(
  'data:,$$='+asyncFunction+';onmessage='+(e => {
    // $$ is a global variable storing the function to "workerize"
    // ... other `onmessage` callback stuff
  })
);
```

The lib cleverly **creates a Web Worker using just Data URL** where the function and `onmessage` callback are stringified. Try running the following snippet in Chrome console:

```js
const worker = new Worker('data:,postMessage("Hi from the Web Worker")');
worker.onmessage = e => console.log(e.data);
```

# mitt 🥊

[mitt](https://github.com/developit/mitt) is a tiny event-emitter library, to create event subscription like `window.addEventListener('click', fn)`. It's just 200 bytes gzipped, but nevertheless there's always something to learn:

## Bitwise operator '>>>'

```js
// Source: https://github.com/developit/mitt/blob/f38922aa9190c9126c8fdc3306b32bd2c248b77e/src/index.js#L44
off(name, handler) {
  if (handlers[name]) {
    handlers[name].splice(handlers[name].indexOf(handler) >>> 0, 1);
  }
}
```

The implementation of the `.off` method, which allows to remove an event handler, uses the bitwise operator `>>>`. I never use [bitwise operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Unsigned_right_shift) because they are clever solutions but so difficult to understand and it's not worth it (usually).

`9 >>> 2` shifts 9 (`1001` in binary) of 2 bits to the right, resulting in 2 (`10` in binary).

`all[type].indexOf(handler) >>> 0` then doesn't do anything usually because it shifts, the **positive** index, of 0 bits that is leaving it untouched. But when `.indexOf(handler)` doesn't find the handler, it returns `-1` and `-1 >>> 0` yields a huge number `4294967295`. This is caused by the [standard used by JS to encode numbers](http://2ality.com/2012/04/number-encoding.html).

Combine this information with the awareness that, from [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice#Syntax), `splice` won't do anything if called with a value greater than the length of the array.

We can conclude then that the bitwise operator is used to avoid `.splice` removing any item if the handler is not found. All without first checking if the item is present.

However this usage of `>>>` reminds me of another bitwise operator: `~` (NOT operator). It's usually used in boolean expressions, such as in:

```js
if (~array.indexOf(item)) {
  ...
}
```

Put simply, given a number `x`, `~x` it yields `-(x + 1)`, so when `.indexOf` returns `-1`:

`if(~(-1)) === if (-(-1+1)) == if (0) == if (false)`

How to be hated by your colleagues in one character 😄

# unfetch 🐶

[unfetch](https://github.com/developit/unfetch) is a 500Bytes polyfill of native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Bitwise again with '|' operator

```js
// Source: https://github.com/developit/unfetch/blob/55560157515dc32b4612daf2653d0300c6ddbe7c/src/index.js#L36

const responseOkay = ((request.status / 100) | 0) == 2; // 200-299
```

If you liked the previous snippets with bitwise operators, you'll love this one.  
To control if the network response status is between 200-299, which means the request was successful, the bitwise operator `|` is used to floor the number and check if it's equal to 2. Apparently this is much faster than usual `status >= 200 && status < 300` according to this [jsperf test](https://jsperf.com/or-vs-floor/2).

## Decko 💨

It happens even to the best of us: the following is a wrong implementation of neither `throttle` nor `debounce` and it's taken from [Decko](https://github.com/developit/decko), a lib for 3 very useful decorators:

```js
function debounce(fn, delay) {
  return function(...a) {
    args = a;
    context = this;

    if (!timer) timer = setTimeout( () => {
      fn.apply(context, args);
      args = context = timer = null;
    }, delay);
  };
}
```

In my opinion, it's wrong because it always calls the function `fn` after `delay` ms, even if there are other calls during the time span, whereas a correct debounce waits for `delay` ms *without any call*.

Suppose we represent 1ms as `-` (hyphen) and 3 calls of the debounced function with a delay of `4s`:

```
Debounce from Decko:
--a--b-----c----
------b--------c // <= b is wrong, should delay 4s from its call, not from the call of `a`

Correct debounce:
--a--b-----c----
---------b-----c
```

The reason because it's also an incorrect implementation of `throttle` is left to you, but you can read more about it in [Throttling function calls](https://remysharp.com/2010/07/21/throttling-function-calls). Anyway, there's already [an open issue in decko about debounce](https://github.com/developit/decko/issues/9).

This teaches us that it's okay not knowing to implement perfectly all this stuff and still be great. We all learn by making mistakes and it takes time.

## Conclusion

We have seen a lot of interesting tricks, some questionable, but knowledge is always useful. I left `Preact` out this article because it's already quite long, but maybe next time I'll publish *"What I've learnt reading Preact source code"* 😄

In the meanwhile, I suggest you do the same with the packages mentioned in the article and comment on any other trick you discovered!

---

(*): nevertheless the React team tries a lot to help you to get started on their source code
