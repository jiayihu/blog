import timeago from 'timeago.js';

// ISSUE_ID is globally injected by article template
const API_URL = `https://api.github.com/repos/jiayihu/blog/issues/${window.ISSUE_ID}/comments`;
const TOKEN = process.env.GITHUB;

const relativeFromNow = timeago();

function renderComment(comment) {
  return `
    <li class="comment flex mt3">
      <div class="comment__author mr2 tc">
        <a href="${comment.user.html_url}" class="dib h2--half w2--half">
          <img src="${comment.user.avatar_url}" alt="${comment.user
    .login}" class="br2 h2--half w2--half dib" />
        </a>
      </div>
      <div class="fg1 br2 ba b--moon-gray f6">
        <div class="comment__header bb b--moon-gray bg-black-05 flex items-center silver ph3 pv2">
          <span>
            <a href="${comment.user.html_url}" class="link underline-hover near-black">
              ${comment.user.login}
            </a>
            commented
            <a href="${comment.html_url}" class="link underline-hover silver">
              ${relativeFromNow.format(comment.created_at)}
            </a>
          </span>
          ${comment.user.login === 'jiayihu'
            ? '<span class="ba b--moon-gray br2 mla f7 fw7 ph2 pv1">Author</span>'
            : ''}
        </div>
        <div class="comment__body pa3">${comment.body_html}</div>
      </div>
    </li>
  `;
}

function renderContent(content) {
  const container = document.querySelector('.comments-content');

  container.innerHTML = content;
}

function renderList(comments) {
  const list = `
    <ul class="list pl0">
      ${comments.map(comment => renderComment(comment)).join('')}
    </ul>
  `;

  renderContent(list);
}

function renderNoComments() {
  const info = `
    <p class="f6 tc">Be the first to comment.<p>
  `;

  renderContent(info);
}

function renderError() {
  const info = `
  <div class="flex items-center justify-center pa4 bg-washed-red near-black f6">
    <span class="lh-title ml3">Comments are not available yet for this article.</span>
  </div>
  `;

  renderContent(info);
}

export default function renderComments() {
  fetch(API_URL, {
    headers: {
      Accept: 'application/vnd.github.v3.html+json',
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'tapplicationext/json',
    },
    mode: 'cors',
  })
    .then(response => response.json())
    .then(comments => {
      if (!comments.length) {
        renderNoComments();
        return;
      }

      renderList(comments);
    })
    .catch(error => {
      console.error(error);
      renderError();
    });
}
