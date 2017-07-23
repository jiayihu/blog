const cssImport = require('postcss-import');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const autoprefixer = require('autoprefixer');

const IS_DEV = process.env.NODE_ENV !== 'production';

const devPlugins = [
  cssImport({
    path: ['styles/'],
  }),
  autoprefixer({
    browsers: ['last 2 versions', 'IE >= 10'],
  }),
  cssnext({
    features: {
      customProperties: {
        preserve: false,
      },
    },
    warnForDuplicates: false,
  }),
];

module.exports = {
  plugins: IS_DEV ? devPlugins : [...devPlugins, cssnano()],
};
