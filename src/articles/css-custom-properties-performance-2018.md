---
title: CSS Custom Properties performance in 2018
subtitle: How are CSS Custom Properties performing in 2018?
date: 2018-09-11
layout: article.html
cover: /images/css-custom-properties-performance-2018/cover.jpg
coverColor: \#AAA496
---

**CSS Custom Properties**, aka **CSS variables**, have been available in stable Firefox since 2014 and Chrome since 2016. Despite its availability, its usage has not spread yet, and performance could be one of the reasons.

<aside class="notice">
You can read about what are Custom Properties on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).
</aside>

In particular, custom properties are like `color` or `font-size`, and they are inherited by children elements. Besides, it's ubiquitous to set them in the *root* as follows:

```css
:root { --color: red; }

button {
  color: var(--color);
}
```

This CSS defines a `--color` custom property to the document root, which is the `html` element, and it will be inherited by all its nested children  allowing any `button` style to use it as variable.

Due to the impact of modifying a root custom property, there are valid performance issues to be kept in mind. Lisi Linhart wrote a detailed article about [CSS custom variables performance](https://lisilinhart.info/) in July 2017, so let's see if things have changed meanwhile.

## Style recalculation 

```html
<div class="container">
  <span class="el"></span>
... 25000 more elements
</div>
``` 

```css
.el {
  background: var(--bg, orange);
}
```

Given a `container` of 25000 `span` nodes, the benchmark will set a `--bg` property on the container and then use it for each child. With my current laptop, a *2018 MacBook Pro 15" 2,2 GHz Intel Core i7*, I get a far worse result: **644ms (now) compared to 76ms (previous)**.

76ms seems to be too good though, and maybe it was an oversite by Lisi Linhart. [Another benchmark by Matt Stow](https://codepen.io/stowball/pen/ygmLrQ) in 2017 returned a rendering time of 51ms for 1k items, whereas I get around 66ms for the same elements. Therefore I doubt it was possible to achieve 76ms with 25k spans.

Setting a custom property only on a single child hasn't changed instead: **1.4ms (now) compared to 1.6ms (previous)**.

So it's still clear that we must be careful with container custom properties because it affects children nodes and recalculation becomes expensive. If you use Custom Properties throughout your application and by defining them at the root element, you'll incur significant performance issues.

However, this information alone doesn't help with deciding whether to use them or not because other solutions which require children to change their styles are also not cheap. Let's, for instance, compare it with inline styles, which is one of the strategies used in React for dynamic styling.

![Custom properties vs inline styles](/images/css-custom-properties-performance-2018/inline-vs-variables.png)

[Try it yourself on Codepen](https://codepen.io/jiayihu/pen/BOrLea?editors=0111), forked from the one by Lisi Linhart.

Results show how inline styles are actually slower than setting a custom property on the parent. You might therefore consider using CSS variables if you are currently relying on inline styles for dynamic styling.

## Using calc()

The next case she tested was using CSS `calc()` with different variations of the CSS variable with/without unit.

```js
el.style = "transform: translateY(calc(var(--translation) * 1px))";
el.style = "transform: translateY(var(--translationPx))";
el.style = "transform: translateY(100px))";
el.style = "transform: translateY(calc(var(--translation) * 1%))";
el.style = "transform: translateY(var(--translationPercent))";
el.style = "transform: translateY(100%))";
```

[Try it yourself on jsperf.com](https://jsperf.com/css-variables-with-without-calc)

The previous result, by Lisi Linhart:

![Previous benchmark on calc() with CSS variables](/images/css-custom-properties-performance-2018/lisi-calc.png)

Current result, on my machine:

![Current benchmark on calc() with CSS variables](/images/css-custom-properties-performance-2018/calc-benchmark.png)

The results seem to be consistent with the previous ones:

1. As before, using static values like `100px` is the fastest option
2. Setting a CSS variable with unit like `--translationPx: 100px` is slower
3. Unitless CSS variables like `--translation: 100` is the slowest alternative

Performance appears to be almost the same as before, but here's the oddity: if you try a similar test with 10k elements [on Codepen](https://codepen.io/lisilinhart/pen/weExoJ?editors=0111), it will give completely different results.

![Custom properties calc performance on Codepen](/images/css-custom-properties-performance-2018/calc-benchmark-codepen.png)

The several ways of using `calc` with CSS variables don't have any actual performance difference! Why are the metrics contrasting on jsperf.org and Codepen?

The reason is that the jsperf test applies the CSS variable to each single node

```js
for (var i = 0; i < testNodes.length; i++) {
  testNodes[i].style = "..."
}
```

whereas the Codepen benchmark sets the property on the container element and the calculation is needed only once

```js
container.style = "--translation: var(--yPercent);" 
```

So how `calc()` is used doesn't make a difference if it's set once in a parent container, otherwise you must be careful to repeat the operation on a large number of nodes. In both cases, using variables with units is preferable.

## Setting CSS Variables with JS

Last test from Lisi Linhart: setting the custom property with JS in distinct ways.

```js
testNodes[i].style.setProperty('--color', 'green');
testNodes[i].style = "--color: green";
testNodes[i].style = "color: green";
testNodes[i].style.setProperty('color', 'green');
```

![My results for Custom Properties in JS](/images/css-custom-properties-performance-2018/custom-properties-js.png)

We can conclude that `el.setProperty('color', 'green')` is still the fastest option, but surprisingly `el.setProperty('--color', 'green')` is faster than `el.style = "color: green"`, which means that `setProperty` is always more performant than inline styles, even when setting a custom property versus an inline hard-coded value. The reason could be that setting inline styles requires parsing the CSS.

So now we have ended the benchmarks done by Lisi Linhart, but we have one more from me.

## CSS variables start-up performance

Since you cannot escape the time of the initial render, even if you never modify any custom property, let's see how Chrome performs with loading a page of 25k items with and without custom properties:

```css
/* With Custom Properties */
:root {
  --bg: orange;
}

.el {
  background: var(--bg);
}
```

```css
/* Without Custom Properties */
.el {
  background: orange;
}
```

![Static CSS initial render](/images/css-custom-properties-performance-2018/start-up-static-css.png)

![Custom properties initial render](/images/css-custom-properties-performance-2018/start-up-CSS-variable.png)

The initial render with CSS variables is noticeable slower: 416ms vs 159ms. It's not that bad though, but still to be kept in mind when using Custom Properties in a large application.

You might prefer to avoid shipping custom properties if you don't need to change them at runtime. [postcss-custom-properties](https://github.com/postcss/postcss-custom-properties#preserve) supports the option `preserve: false` to remove custom properties in compilation.

## Conclusions

Compared to 2017, there have been some minor improvements with CSS Custom Properties performances. I definitely believe the time is mature to start using them in production, as more and more modern features like [CSS Paint API](https://developers.google.com/web/updates/2018/01/paintapi#parameterizing_your_worklet) will rely on them.

Nevertheless, we still have to be careful with their scope, by limiting usage of root properties, and we must not forget to measure the initial render timing.
