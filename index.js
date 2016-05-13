const metalsmith = require('metalsmith');
const md = require('metalsmith-markdown');
const layouts = require('metalsmith-layouts');
const permalinks = require('metalsmith-permalinks');
const collections = require('metalsmith-collections');
const pagination  = require('metalsmith-pagination');
const snippet     = require('metalsmith-snippet');

metalsmith(__dirname)
  .source('src')
  .use(collections({
    articles: {
      pattern: 'articles/**/*.md',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(pagination({
    'collections.articles': {
      perPage: 5,
      first: 'index.html',
      path: 'page/:num/index.html',
      layout: 'index.jade'
    }
  }))
  .use(md({
    gfm: true
  }))
  .use(snippet({
    maxLength: 300
  }))
  .use(permalinks({
    pattern: ':title'
  }))
  .use(layouts({
    engine: 'jade',
    pretty: true
  }))
  .destination('public')
  .build((err) => console.log(err));
