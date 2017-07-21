const cssImport = require('postcss-import');
const cssnext = require('postcss-cssnext');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    cssImport({
      path: ['styles/'],
    }),
    autoprefixer({
      browsers: ['last 2 versions', 'IE >= 10'],
    }),
    cssnext({
      features: {
        customProperties: {
          preserve: true,
        },
      },
      warnForDuplicates: false,
    }),
  ],
};
