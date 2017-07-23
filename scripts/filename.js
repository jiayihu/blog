module.exports = function() {
  return files => {
    Object.keys(files).forEach(filepath => {
      if (!files[filepath].filename) {
        const filename = filepath.replace(/^.*[\\\/]/, '').replace('.html', '');
        files[filepath].fileName = filename; // Use camelCase to avoid confict with other plugins
      }
    });
  };
};
