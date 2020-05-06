import { readLocalStorage, saveLocalStorage } from "./utils";

const CACHE_PAGES = "jiayihu-pages-v1";
const STORAGE_KEY = "jiayihu/offline-pages";

function renderButton(button) {
  const url = window.location.href;
  const saved = readLocalStorage(STORAGE_KEY) || [];

  const alreadySaved = saved.find((x) => x.url === url);

  if (alreadySaved) {
    button.textContent = "Saved for offline";
    return;
  }

  button.textContent = "Save for offline";
  button.addEventListener("click", () => {
    button.textContent = "Saving...";
    caches.open(CACHE_PAGES).then((cache) => {
      cache.add(url).then(() => {
        const metadata = {
          url: url,
          title: document.querySelector(".article__title").textContent.trim(),
          subtitle: document
            .querySelector(".article__subtitle")
            .textContent.trim(),
        };

        saveLocalStorage(STORAGE_KEY, [...saved, metadata]);

        renderButton(button);
      });
    });
  });
}

export default function saveOffline() {
  const container = document.createElement("div");

  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.className = `bg-transparent underline f6 dim ba bw0 ph3 pv2 mb2 dib near-black`;

  container.appendChild(button);
  document.querySelector(".article__header").appendChild(container);

  renderButton(button);
}
