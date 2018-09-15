// @ts-check

import timeago from 'timeago.js';
import hex2ascii from './hex';

const relativeFromNow = timeago();

function commentHTML(comment) {
  return `
    <li class="comment flex mt3">
      <div class="comment__author mr2 tc">
        <a href="${comment.user.html_url}" class="dib h2--half w2--half">
          <img
            src="${comment.user.avatar_url}"
            alt="${comment.user.login}"
            class="br2 h2--half w2--half dib"
          />
        </a>
      </div>
      <div class="fg1 br2 ba b--moon-gray f6">
        <div class="comment__header bb b--moon-gray flex items-center silver ph3 pv2">
          <span>
            <a href="${comment.user.html_url}" class="fw7 link mid-gray underline-hover">
              ${comment.user.login}
            </a>
            commented
            <a href="${comment.html_url}" class="link underline-hover silver">
              ${relativeFromNow.format(comment.created_at)}
            </a>
          </span>
          ${
            comment.user.login === 'jiayihu'
              ? '<span class="ba b--moon-gray br2 mla f7 fw7 ph2 pv1">Author</span>'
              : ''
          }
        </div>
        <div class="comment__body ph3">${comment.body_html}</div>
      </div>
    </li>
  `;
}

function listHTML(comments) {
  return `
    <ul class="list pl0">
      ${comments.map(comment => commentHTML(comment)).join('')}
    </ul>
  `;
}

function noCommentsHTML() {
  return `
    <p class="f6 tc">Be the first to comment.<p>
  `;
}

function errorHTML() {
  return `
    <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">
      <span class="lh-title ml3">Comments are not shown yet for this article.</span>
    </div>
  `;
}

function renderContent(content) {
  const container = document.querySelector('.comments-content');

  // Comments from Github API are already sanitized
  container.innerHTML = content;
}

function renderComments(comments) {
  if (!comments.length) {
    renderContent(noCommentsHTML());
    return;
  }

  renderContent(listHTML(comments));
}

export default function requestComments() {
  if (!window.ISSUE_ID) return renderContent(errorHTML()); // ISSUE_ID is globally injected by article template

  // ISSUE_ID is globally injected by article template
  const API_URL = `https://api.github.com/repos/jiayihu/blog/issues/${window.ISSUE_ID}/comments`;
  // GitHub doesn't allow access tokens to be committed, but we need to push the script to GH Pages.
  const TOKEN = hex2ascii(process.env.GITHUB_HEX);

  fetch(API_URL, {
    headers: {
      Accept: 'application/vnd.github.v3.html+json',
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  })
    .then(response => {
      if (response.ok) return response.json();
      else return Promise.reject(response.statusText);
    })
    .then(renderComments)
    .catch(error => {
      console.error(error);
      renderContent(errorHTML());
    });

  if ('caches' in window) {
    /*
    * Check if the service worker has already cached this API requesti
    */
    caches.match(API_URL).then(response => {
      if (!response) return;

      response.json().then(renderComments);
    });
  }
}
