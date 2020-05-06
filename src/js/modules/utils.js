export function readLocalStorage(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.log("Error reading from localStorage");
    console.error(error);
    return null;
  }
}

export function saveLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("Error saving to localStorage");
    console.error(error);
  }
}
