import addAnchors from './modules/anchors';
import addReadingTime from './modules/reading-time';

const isArticle = document.body.classList.contains('page--article');

if (isArticle) {
  addAnchors();
  addReadingTime();
}
