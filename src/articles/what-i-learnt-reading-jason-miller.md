---
title: What i learnt reading Jason Miller's source code
subtitle: Some subtitle
date: June 24th, 2018
layout: article.html
draft: true
cover: /images/testing-rxjs6/cover.jpg
coverColor: \#ffffff
---

- Minimal enough to be understandable and not loose yourself in edge cases implementations
- Miller's code aim to be balanced in terms of performance, readability and brevity
- Not all the source code is his, but surely from contributors

## Warning ⚠️

The following snippets are not meant to shown as examples of best practises. They are just pieces of code which I found interesting and my explanation could be also different from the original reason, thought by Miller.

Also many snippets are changed a bit from the original source code to focus on the meaning.

# Microbundle 📦 

[microbundle](https://github.com/developit/microbundle) is a bundler, like Rollup (which is used under-the-hood), for tiny modules and without configuration.

## Array.prototype.concat

```javascript
// source: https://github.com/developit/microbundle/blob/bf2d068dc646fcce976456359ee9c4689b74bea6/src/index.js#L93
[]
  .concat(
    options.entries && options.entries.length
      ? options.entries
      : options.pkg.source || options.pkg.module,
  )
  .map(file => glob(file))
  .forEach(options.input.push(...file));
```

It takes advantages on `Array.prototype.concat` which can accept both  arrays and values. I would have written the same code as follows:

```javascript
const input = options.entries && options.entries.length
      ? options.entries
      : [options.pkg.source || options.pkg.module];

input
  .map(file => glob(file))
  .forEach(options.input.push(...file));
```

I think it's more readable but it takes one more variable, not used anymore and maybe it would make the reader wondering "Where else would it be used?". Also my solution cannot be used as expression, such as in `{ input: expression }` whereas you can do `{ input: [].concat(...) }`.

## .filter(Boolean)

I already knew the trick `array.filter(Boolean)` to remove untruthy values, but this is the next level of it. You can use it to add optional values in an array using a single expression:

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

It gets an array of unique values by cleverly removing duplicate items, which will have `arr.indexOf(item)` returning a smaller index. I usually use another solution based on [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), which stores unique values by definition.

```js
const unique = Array.from(new Set(entries));
```

# Workerize 🏗️

[workerize](https://github.com/developit/workerize) allows to run code, passed as string, in a **Web Worker**. Example from the doc:

```js
let worker = workerize(`
	export function add(a, b) {
		// block for half a second to demonstrate asynchronicity
		let start = Date.now();
		while (Date.now()-start < 500);
		return a + b;
	}
`);

(async () => {
	console.log('3 + 9 = ', await worker.add(3, 9));
	console.log('1 + 2 = ', await worker.add(1, 2));
})();
```

## Blob URL Worker

The source code of the package is about 70 LOC and for me the most interesting piece is the following:

```js
// Source: https://github.com/developit/workerize/blob/683631f402443d71484b03d087b37c72e65f2e3d/src/index.js#L25
let url = URL.createObjectURL(new Blob([code]));
let worker = new Worker(url, options);
```

Basically, it allows to create a Web Worker without any separate JS file, by passing a String URL which represents a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), which in turn is a file-like object containing the source code. Try the following snippet in Chrome console to see it working:

```js
const url = URL.createObjectURL(new Blob(['postMessage("Hi from the Worker")']))
const worker = new Worker(url);
worker.onmessage = e => console.log(e.data);
```

# Greenlet 🦎

[greelet](https://github.com/developit/greenlet) is like `workerize` but for single functions. In the previous case we have seen how a Web Worker can be created using just a Blob URL, but actually this package shows that you can achieve the same result also using [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs):

```js
// Source: https://github.com/developit/greenlet/blob/d4d3f0d903ef34df69443f6f86a81d0fa6035c56/greenlet.js#L15
const worker = new Worker(
  'data:,$$='+asyncFunction+';onmessage='+(e => {
    // $$ is the variable for the passed function
    // ... other `onmessage` callback stuff
  })
);
```

## Data URL Worker

The lib creates a Web Worker using a Data URL where the function and `onmessage` callbacks. Try running the following snippet in Chrome console:

```js
const worker = new Worker('data:,postMessage("Hi from the Web Worker")');
worker.onmessage = e => console.log(e.data);
```

# mitt 🥊

[mitt](https://github.com/developit/mitt) is a tiny event-emitter library, to create APIs like `window.addEventListener('click', fn)`. It's just 200 bytes gzipped, but nevertheless there's always something to learn:

## Bitwise operator >>>

```js
// Source: https://github.com/developit/mitt/blob/f38922aa9190c9126c8fdc3306b32bd2c248b77e/src/index.js#L44
off(name, handler) {
  if (handlers[name]) {
    handlers[name].splice(handlers[name].indexOf(handler) >>> 0, 1);
  }
}
```

The implementation of the `.off` method, which allows to remove an event handler, uses the bitwise operator `>>>`. I never use [bitwise operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Unsigned_right_shift) because they are clever solutions but so difficult to understand and it's not worth it (usually).

`9 >>> 2` shifts 9 (`1001` in binary) of 2 bits, resulting in 2 (`10` in binary).

`all[type].indexOf(handler) >>> 0` then doesn't do anything usually because it shifts, the **positive** index, of 0 bits that is leaving it untouched. The special case is when `.indexOf(handler)` doesn't find the handler and returns `-1`. Due to [how numbers are encoded in JS](http://2ality.com/2012/04/number-encoding.html), `-1 >>> 0` yields a huge number `4294967295`.

Combine this information with the awareness that, from [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice#Syntax), `splice` won't do anything if called with a value greater than the length of the array.

We can conclude then that the bitwise operator is used to avoid `.splice` removing any item if the handler is not found.

This usage of `>>>` reminds me of another bitwise operator: `~` (NOT operator). It's usually used in boolean expressions, such as in:

```js
if (~array.indexOf(item)) {
  ...
}
```

Put simply, given a number `x`, `~x` it yields `-(x + 1)`, so:

`if(~(-1)) === if (-(0+1)) == if (0) == if (false)`

How to be hated by your colleagues in one character 😄

## Conclusion

Even the greatest can fail sometimes: the following is a wrong implementation of neither `throttle` nor `debounce` and it's taken from [Decko](https://github.com/developit/decko):

```js
debounce(fn, delay) {
  return function(...a) {
    args = a;
    context = this;

    if (!timer) timer = setTimeout( () => {
      fn.apply(context, args);
      args = context = timer = null;
    }, delay);
  };
},
```

In my opinion, it's wrong because it always calls the function `fn` after `delay` ms, even if there are other calls during the time span, whereas a correct debounce waits for `delay` ms *without any call*.

Suppose we represent 3 calls of the debounced function and with a delay of `4s`:

```
Wrong debounce:
--a--b-----c----
------b--------c // <= b is wrong, should delay 4s from its call, not from call of `a`

Correct debounce:
--a--b-----c----
---------b-----c
```

The reason because it's also an incorrect implementation of `throttle` is left to you, but you can read more about it in [Throttling function calls](https://remysharp.com/2010/07/21/throttling-function-calls). Anyway there's already [an open issue in decko about debounce](https://github.com/developit/decko/issues/9).

This teaches us that it's okay not knowing to implement all this stuff. We all learn by taking mistakes

Maybe next time I'll publish "What I learnt reading Preact source code" :D
