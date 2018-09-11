---
title: CSS resets in Shadow DOM
subtitle: How to apply reset.css or normalize.css with Web Components encapsulated in Shadow DOM 
date: 2018-09-05
layout: article.html
cover: /images/css-reset-shadow-dom/cover.jpg
coverColor: \#AAA496
overlayAlpha: 30
---

Now that also [Firefox 63 is supporting **Web Components**](https://blog.nightly.mozilla.org/2018/09/06/developer-tools-support-for-web-components-in-firefox-63/), they are definitely the new shiny technology in the front-end which allow creating reusable Custom Elements using standard JavaScript APIs. With **Shadow DOM**, they are even well encapsulated, but this raises some questions like how to reset the CSS within the Shadow DOM.

<aside class="notice">
You can read more about Web Components on [MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components).
</aside>

When building Web Components, Shadow DOM allows encapsulation of what the component renders. As the name suggests, Shadow DOM attaches a separate hidden DOM tree to your element, allowing you to keep the internal DOM and the styles private. For the CSS, this means that any style outside the element has no impact within the Shadow DOM and vice-versa any style defined in the latter doesn't affect elements out of it.

Let's define a simple Custom Elements for our special paragraph component:

```js
const template = document.createElement('template')
template.innerHTML = `
  <style>
    p {
      color: white;
      background-color: #666;
      padding: 5px;
    }
  </style>
  <p>My paragraph</p>
`

class MyParagraph extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('my-paragraph');

      this.attachShadow({mode: 'open'})
        .appendChild(template.content.cloneNode(true));
  }
}

customElements.define('my-paragraph', MyParagraph)
``` 

It's possible then to use it as `<my-paragraph></my-paragraph>`, and it renders a paragraph with white text, grey background and 5px padding. You can [see it live on Codepen](https://codepen.io/jiayihu/pen/RYxVrr?editors=1010) using the latest Chrome, Safari or Firefox. [Edge is the only one missing Web Components](https://caniuse.com/#feat=custom-elementsv1) yet.

Now, if we define the following global CSS declaration, we can notice that it doesn't have an impact on our custom paragraph although a `<p>` element is used within it.

```css
p {
  text-transform: uppercase;
}
```

Likewise, `MyParagraph` styles don't have effects on the outer `<p>Usual paragraph</p>` declared in the HTML.

Okay that it's clear what Shadow DOM means for styles, let's proceed with the main topic of the article.

## How to reset the CSS in Web Components

Since Shadow DOM is separated from the rest of the document, this means that your Custom Elements won't be able to be styled by your global CSS reset like [reset.css](https://meyerweb.com/eric/tools/css/reset/) or [normalize.css](https://necolas.github.io/normalize.css/). By default, without any style from yours, they use the User Agent stylesheet defined by the browser along with all the inconsistencies between browsers.

With the deprecation of `/deep/` and `>>>` CSS selectors, it's impossible for any stylesheet to customize the style within a Shadow DOM even if the purpose is to reset it.

The only way, as far as I know, is to import the CSS reset within every your Web Component, for instance `@import 'normalize.css';` as Sass or PostCSS. The problem is that this duplicates much code. `normalize.css` is almost 6KB uncompressed, which means that if you have 100 components, you  deliver `600KB` of duplicated code.

The philosophy of Web Components is to build isolated components which can be used anywhere without the need of other libraries and, for this reason, they must share nothing between each other and they must contain all the needed code to work alone.

However, this means also that your single Custom Element doesn't need the whole reset CSS. It can import only the parts which affect its Shadow DOM.

Taking [normalize.css](https://necolas.github.io/normalize.css/) as example, we are able to divide it into tiny pieces like the following:

``` 
normalize
   ├── document.css
   ├── embedded.css
   ├── forms.css
   ├── grouping.css
   ├── interactive.css
   ├── misc.css
   ├── sections.css
   └── text-level.css
``` 

```css
/* Embedded content
   ========================================================================== */

/**
 * Remove the border on images inside links in IE 10.
 */

img {
  border-style: none;
}
```

```css
/* Forms
   ========================================================================== */

/**
 * 1. Change the font styles in all browsers.
 * 2. Remove the margin in Firefox and Safari.
 */

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

/**
  * Show the overflow in IE.
  * 1. Show the overflow in Edge.
  */

button,
input {
  /* 1 */
  overflow: visible;
}

/** ... other form resets */
```

```css
/* Sections
   ========================================================================== */

/**
 * Correct the font size and margin on `h1` elements within `section` and
 * `article` contexts in Chrome, Firefox, and Safari.
 */

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-font-smoothing: antialiased;
  -o-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

```

So then Web Components can import only the single pieces they require. I use [postcss-import](https://github.com/postcss/postcss-import), but you can apply the same technique in Sass or Less.

```css
@import 'normalize/embedded.css';
@import 'normalize/sections.css';

h1 {
  color: rebeccapurple;
}

/** Other component styles */

``` 

This strategy is not optimal because there is still duplication, but at least it's minimal. It's a good compromise of isolation and duplication: you get independent Web Components with minimal inevitable CSS duplication.

---

What do you think of this strategy? For the time being it's the best one I know, and the tip was given by a friend of mine [@MaxArt2501](https://github.com/MaxArt2501). If you come up with a better strategy, let me know in the comments.
