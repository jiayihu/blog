import addAnchors from './modules/anchors';

const isArticle = document.body.classList.contains('page--article');

if (isArticle) addAnchors();
