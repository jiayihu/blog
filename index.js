const metalsmith = require('metalsmith');

const collections = require('metalsmith-collections');
const drafts = require('metalsmith-drafts');
const ignore = require('metalsmith-ignore');
const layouts = require('metalsmith-layouts');
const md = require('metalsmith-markdown');
const pagination = require('metalsmith-pagination');
const permalinks = require('metalsmith-permalinks');
const snippet = require('metalsmith-snippet');

const nunjucks = require('nunjucks');

const marked = require('marked');

const renderer = new marked.Renderer();
const defaultLinkRenderer = renderer.link;
renderer.link = function(...args) {
  return defaultLinkRenderer.apply(renderer, args).replace('<a', '<a class="red dim"');
};

marked.setOptions({
  renderer,
});

// Disable caching
nunjucks.configure({
  noCache: true,
});

function build(success) {
  metalsmith(__dirname)
    .source('src')
    .clean(false)
    .use(ignore(['styles/**/*.css', 'static/**/*', 'static/**/.*', 'js/**/*.js']))
    .use(drafts())
    .use(
      collections({
        articles: {
          pattern: 'articles/**/*.md',
          sortBy: 'date',
          reverse: true,
        },
      })
    )
    .use(
      pagination({
        'collections.articles': {
          perPage: 5,
          first: 'index.html',
          filter: page => !page.static,
          path: 'page/:num/index.html',
          layout: 'index.html',
        },
      })
    )
    .use(
      md({
        gfm: true,
      })
    )
    .use(
      snippet({
        maxLength: 300,
      })
    )
    .use(
      permalinks({
        pattern: ':title',
      })
    )
    .use(
      layouts({
        engine: 'nunjucks',
        pretty: true,
      })
    )
    .destination('public')
    .build(err => {
      if (err) console.log(err);
      else success();
    });
}

module.exports = build;
