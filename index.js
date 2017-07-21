const metalsmith = require('metalsmith');
const md = require('metalsmith-markdown');
const layouts = require('metalsmith-layouts');
const collections = require('metalsmith-collections');
const drafts = require('metalsmith-drafts');
const permalinks = require('metalsmith-permalinks');
const pagination = require('metalsmith-pagination');
const snippet = require('metalsmith-snippet');
const ignore = require('metalsmith-ignore');

const nunjucks = require('nunjucks');

// Disable caching
nunjucks.configure({
  noCache: true,
});

function build(success) {
  metalsmith(__dirname)
    .source('src')
    .clean(false)
    .use(ignore(['styles/**/*.css']))
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
      if(err) console.log(err);
      else success();
    });
}

module.exports = build;
