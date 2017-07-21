---
title: Example title.
date: 21-07-2017
author: JIAYI HU
layout: article.html
cover: http://mrmrs.github.io/photos/u/009.jpg
---

Example content. Meh.

```javascript
const path = require('path');
const webpack = require('webpack');
const AotPlugin = require('@ngtools/webpack').AotPlugin;

const prodPlugins = [
  new AotPlugin({
    tsConfigPath: 'tsconfig.json',
    entryModule: path.resolve(__dirname, 'examples/app/app.module#AppModule'),
    compilerOptions: {
      angularCompilerOptions: {
        genDir: 'examples-dist',
        skipMetadataEmit: true
      }
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: false,
    output: { comments: false },
    compressor: {
      warnings: false
    }
  })
];

module.exports = {
  devtool: 'eval',
  entry: path.join(root.src, IS_DEV ? 'main.ts' : 'main-prod.ts'),
  output: {
    path: root.dest,
    publicPath: 'dist',
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: IS_DEV ? ['ts-loader', 'angular2-template-loader'] : '@ngtools/webpack',
        exclude: IS_DEV ? [/node_modules/] : []
      },
      {
        test: /\.html$/,
        use: 'raw-loader',
        exclude: [/node_modules/]
      }
    ]
  },
  plugins: IS_DEV ? devPlugins : prodPlugins
};
```
