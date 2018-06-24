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

[workerize](https://github.com/developit/workerize) allows to run code, passed as string, in a Web Worker. Example from the doc:

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

The lib creates a Web Worker using a Data URL where the function and `onmessage` callbacks. Try running the following snippet in Chrome console:

```js
const worker = new Worker('data:,postMessage("Hi from the Web Worker")');
worker.onmessage = e => console.log(e.data);
```
