const metalsmith = require("metalsmith");
require("dotenv").config();

const collections = require("metalsmith-collections");
const drafts = require("metalsmith-drafts");
const filename = require("./scripts/filename");
const filepath = require("metalsmith-filepath");
const githubComments = require("metalsmith-gh-comments");
const ignore = require("metalsmith-ignore");
const layouts = require("metalsmith-layouts");
const md = require("metalsmith-markdown");
const pagination = require("metalsmith-pagination");
const permalinks = require("metalsmith-permalinks");
const snippet = require("metalsmith-snippet");
const dateFormatter = require("metalsmith-date-formatter");

const nunjucks = require("nunjucks");
const marked = require("marked");
const url = require("url");

const renderer = new marked.Renderer();

const defaultLinkRenderer = renderer.link;
renderer.link = function (...args) {
  return defaultLinkRenderer
    .apply(renderer, args)
    .replace("<a", '<a class="link dim"');
};

renderer.codespan = (text) => `<code class="purple">${text}</code>`;

renderer.image = function (href, title, text) {
  return `
    <figure>
      <a href="${href}" target="_blank" rel="noopener noreferrer">
        <img class="lozad" data-src="${href}" alt="${text}" />
      </a>
      <figcaption class="f6 i tr mt1" >${text}</figcaption>
    </figure>
  `;
};

/** @TODO: aside renderer for related articles  */

marked.setOptions({
  renderer,
});

// Disable caching
nunjucks.configure({
  autoescape: false,
  noCache: true,
});

const IS_DEV = process.env.NODE_ENV !== "production";

function build(success) {
  return metalsmith(__dirname)
    .source("src")
    .metadata({
      siteurl: "http://blog.jiayihu.net",
    })
    .clean(false)
    .use(
      ignore(["styles/**/*.css", "static/**/*", "static/**/.*", "js/**/*.js"])
    )
    .use(drafts())
    .use(
      collections({
        articles: {
          pattern: "articles/**/*.md",
          sortBy: "date",
          reverse: true,
        },
      })
    )
    .use(
      pagination({
        "collections.articles": {
          perPage: 15,
          first: "index.html",
          filter: (page) => !page.static,
          path: "page/:num/index.html",
          layout: "index.html",
        },
      })
    )
    .use(
      dateFormatter({
        dates: [{ key: "date", format: "MMM Do YYYY" }],
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
    .use(filename())
    .use(filepath({ absolute: false }))
    .use(
      IS_DEV
        ? () => {}
        : githubComments({
            filter: (article) => !article.static,

            // gh-issues-for-comments options
            idProperty: "link",
            getIssue(article) {
              const formattedTitle = article.title
                .replace(/\s/g, "-")
                .toLowerCase();
              const articleUrl = `${url.resolve(
                "http://blog.jiayihu.net",
                formattedTitle
              )}/`;

              return {
                title: `Comments: ${article.title}`,
                body: `This issue is reserved for comments to [${article.title}](${articleUrl}). Leave a comment below and it will be shown in the blog page.`, // eslint-disable-line
                labels: ["comments"],
              };
            },
            username: "jiayihu",
            repo: "blog",
            token: process.env.GITHUB,
            jsonPath: "scripts/gh-comments.json",
          })
    )
    .use(
      permalinks({
        pattern: ":title",
      })
    )
    .use(
      layouts({
        engine: "nunjucks",
        pretty: true,
      })
    )
    .destination("public")
    .build((err) => {
      if (err) console.log("Error with Metalsmith build", err);
      else success();
    });
}

module.exports = build;
