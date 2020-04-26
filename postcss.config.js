const cssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
// const uncss = require('postcss-uncss');
// const path = require('path');

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

const prodPlugins = [
  ...devPlugins,
  cssnano(),
  // uncss({
  //   html: ['public/**/*.html'],
  //   htmlroot: path.join(__dirname, 'public'),
  // }),
];

module.exports = {
  plugins: IS_DEV ? devPlugins : prodPlugins,
};
