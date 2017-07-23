import readingTime from 'reading-time';

function injectTime(time) {
  const main = document.querySelector('.article-main');
  const content = document.querySelector('.article-content');

  const node = document.createElement('p');
  node.classList.add('i', 'f5');
  node.textContent = time;

  main.insertBefore(node, content);
}

export default function addReadingTime() {
  const content = document.querySelector('.article-content');
  const text = content.innerHTML.replace(/<(?:.|\n)*?>/gm, '');
  const stats = readingTime(text);

  injectTime(stats.text);
}
