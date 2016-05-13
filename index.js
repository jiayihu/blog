import metalsmith from 'metalsmith';

metalsmith(__dirname)
  .source('src')
  .destination('build')
  .build((err) => console.log(err));
