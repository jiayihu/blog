import lozad from 'lozad';
import addAnchors from './modules/anchors';
import renderComments from './modules/comments';
import addReadingTime from './modules/reading-time';

const isArticle = document.body.classList.contains('page--article');

if (isArticle) {
  // Lazy load images
  const observer = lozad();
  observer.observe();

  addAnchors();
  addReadingTime();
  renderComments();
}
