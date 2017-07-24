import readingTime from 'reading-time';

function injectTime(time) {
  const meta = document.querySelector('.article-meta');

  const node = document.createElement('span');
  node.classList.add('i', 'f5');
  node.textContent = ` - ${time}`;

  meta.appendChild(node);
}

export default function addReadingTime() {
  const content = document.querySelector('.article-content');
  const text = content.innerHTML.replace(/<(?:.|\n)*?>/gm, '');
  const stats = readingTime(text);

  injectTime(stats.text);
}
