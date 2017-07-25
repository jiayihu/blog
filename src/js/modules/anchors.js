export default function addAnchors() {
  const headings = document.querySelectorAll(
    '.article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6'
  );

  Array.from(headings).forEach(heading => {
    const id = heading.id;
    heading.innerHTML =
      `<a href="#${id}" class="color-inherit f4 no-underline underline-hover" aria-hidden="true">#</a> ` +
      heading.innerHTML;
  });
}
