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

The following snippets are not meant to shown as examples of best practises. They are just pieces of code which I found interesting and my explanation could be also different from the original reason thought by Miller.

Also many snippets are changed a bit from the original source code to convey the same meaning but without all the implementation jargon.

# Microbundle 📦 

## Array.prototype.concat

```javascript
// source: https://github.com/developit/microbundle/blob/bf2d068dc646fcce976456359ee9c4689b74bea6/src/index.js#L93
// `options` is an object
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
