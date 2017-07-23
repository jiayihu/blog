export default function addAnchors() {
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');

  Array.from(headings).forEach(heading => {
    const id = heading.id;
    heading.innerHTML =
      `<a href="#${id}" class="color-inherit f4 no-underline underline-hover" aria-hidden="true">#</a> ` +
      heading.innerHTML;
  });
}
