/*
  the gulpfile 
*/

const gulp        = require('gulp'),
      fs          = require('fs'),
      path        = require('path'),
      through2    = require('through2'),
      globby      = require('globby'),
      pfy         = require('./promisify.es6'),
      serve       = require('./task-serve.es6')
;

const SERVE_PORT = 4000,
      PACKAGE    = JSON.parse(fs.readFileSync('./package.json')),
      FILENAME   = `${PACKAGE.name}-${PACKAGE.version}`,
      DIST       = 'dist',
      BIN        = 'node_modules/.bin', 
      HEADER     = `/**
* Package         : ${PACKAGE.name}
* Version         : ${PACKAGE.version}
* GIT Repository  : ${PACKAGE.repository.url}
*
* Description     :
* ${PACKAGE.description.replace(/\n/g,'\n *')}
*
* Copyright ${PACKAGE.author}
*/

`,
      REACT_PACKAGE   = JSON.parse(fs.readFileSync('./node_modules/react/package.json')),
      REACT_FILENAME  = `${REACT_PACKAGE.name}-${REACT_PACKAGE.version}`,
      MDL_PACKAGE     = JSON.parse(fs.readFileSync('./node_modules/material-design-lite/package.json')),
      MDL_FILENAME    = `${MDL_PACKAGE.name}-${MDL_PACKAGE.version}`,
      AMPERE_PACKAGE  = JSON.parse(fs.readFileSync('./node_modules/orangevolt-ampere-ng/package.json')),
      AMPERE_FILENAME = `${AMPERE_PACKAGE.name}-${AMPERE_PACKAGE.version}`
;

const _serve = serve({port:SERVE_PORT});
gulp.task('serve', ['build'], done=>{
  _serve();
  console.log(`open http://localhost:${SERVE_PORT}/examples in your browser`);
  done();
});

pfy.VERBOSE = true;

gulp.task('clean', pfy(`rm -rf ${DIST}`));

gulp.task('prepare', ['clean'], ()=>{
  const copyReact = ()=>Promise.all([
    pfy(`cp node_modules/react/dist/react.js ${DIST}/lib/${REACT_FILENAME}-development.js`)(),
    pfy(`cp node_modules/react/dist/react.min.js ${DIST}/lib/${REACT_FILENAME}.min.js`)(),
    pfy(`cp node_modules/react/dist/react-with-addons.js ${DIST}/lib/${REACT_FILENAME}-with-addons-development.js`)(),
    pfy(`cp node_modules/react/dist/react-with-addons.min.js ${DIST}/lib/${REACT_FILENAME}-with-addons.min.js`)()
  ]);

  const copyMdl = ()=>Promise.all([
    pfy(`cp node_modules/material-design-lite/material.js ${DIST}/lib/${MDL_FILENAME}-development.js`)(),
    pfy(`cp node_modules/material-design-lite/material.min.js ${DIST}/lib/${MDL_FILENAME}.min.js`)(),
    //pfy(`cp node_modules/material-design-lite/material.css ${DIST}/lib/${MDL_FILENAME}-development.css`)(),
    //pfy(`cp node_modules/material-design-lite/material.min.css ${DIST}/lib/${MDL_FILENAME}.min.css`)(),
  ]);

  return pfy(`mkdir -p ${DIST}/lib`)()
  .then(()=>Promise.all([
    pfy(`cp node_modules/babel-core/browser-polyfill.js ${DIST}/lib/browser-polyfill-development.js`)(),
    pfy(`cp node_modules/babel-core/browser-polyfill.min.js ${DIST}/lib/browser-polyfill.min.js`)(),
    copyReact(),
    copyMdl(),
    pfy(`rsync -av --exclude '*.css' --exclude '*.js' --exclude '*.jsx' examples/* ${DIST}/examples`)
  ]))
});

gulp.task('compile', ['prepare'], ()=>{
  const buildAmpere = ()=>Promise.all([
      /*
        TODO : babelify option -optional runtime cannot be set right know because of a bug
        that means that current orangevolt-ampere-ng-react builds unfortunately 
        contains the babel runtime helper
      */
    pfy(`${BIN}/browserify 
      -r ./node_modules/orangevolt-ampere-ng/index.js 
      --standalone Ampere
      --bare
      --debug 
      -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative .]
      -t [ envify --NODE_ENV development] 
      -t [ brfs ] 
      -t [ sweetify node_modules/orangevolt-ampere-ng/remove-console-calls.sjs ]
      --outfile ${DIST}/lib/${AMPERE_FILENAME}-development.js
    `)(),
    pfy(`${BIN}/browserify 
      ./node_modules/orangevolt-ampere-ng/index.js 
      --standalone Ampere
      --bare
      -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative .] 
      -t [ envify --NODE_ENV production] 
      -t [ brfs ] 
      -t [ sweetify node_modules/orangevolt-ampere-ng/remove-console-calls.sjs ]
      --outfile ${DIST}/lib/${AMPERE_FILENAME}.js
    `)()
  ]);

  const buildAmpereReact = ()=>Promise.all([
      /*
        TODO : babelify option -optional runtime cannot be set right know because of a bug
        that means that current orangevolt-ampere-ng-react builds unfortunately 
        contains the babel runtime helper
      */
    pfy(`${BIN}/browserify 
      -r ./index.js 
      --external react
      --external orangevolt-ampere-ng
      --standalone AmpereReact 
      --bare
      --debug 
      -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative .] 
      -t [ envify --NODE_ENV development] 
      -t [ brfs ] 
      -t [ browserify-shim ]
      -t [ sweetify node_modules/orangevolt-ampere-ng/remove-console-calls.sjs ]
      --outfile ${DIST}/lib/${FILENAME}-development.js
    `)(),
    pfy(`${BIN}/browserify 
      -r ./index.js
      --exclude react
      --exclude orangevolt-ampere-ng
      --standalone AmpereReact
      --bare
      -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative .] 
      -t [ envify --NODE_ENV production] 
      -t [ brfs ] 
      -t [ browserify-shim ]
      -t [ sweetify node_modules/orangevolt-ampere-ng/remove-console-calls.sjs ]
      --outfile ${DIST}/lib/${FILENAME}.js
    `)()
  ]);

  const addPrefix = (file)=>{
    const postcss = require('postcss');

      /*
       these rules need to be unprefixed (boworred from mdl css)
       -> thats why we add them manually to head of css
      */
    const output = '' /* + `
html {
  color: rgba(0,0,0, 0.87);
  font-size: 1em;
  line-height: 1.4; 
}

.${PACKAGE.name} {
  font-family:'Roboto','Helvetica','Arial',sans-serif!important;
  background-color:#FAFAFA;
}
    `*/ + 
    postcss()
    //.use(require('postcss-prefix-selector')({ prefix : `.${PACKAGE.name}` }))
    .use(require('postcss-nested')())
    .process(fs.readFileSync(file))
    .css;
    
    fs.writeFileSync(file, output);
    
    return Promise.resolve('ready');
  }

  return Promise.all([
    /*
    pfy(`cp node_modules/babel-core/browser.js node_modules/babel-core/browser.min.js ${DIST}/lib`)(),
    pfy(`rsync -av --exclude '*.less' --exclude '*.es6' --exclude '*.jsx' src/* ${DIST}/src`)(),
    pfy(fs.writeFile, `${DIST}/index.js`, `${babel.buildExternalHelpers()}`)(),
    pfy(`${BIN}/browserify node_modules/babel-runtime/node_modules/core-js/index.js node_modules/babel-runtime/regenerator/index.js $(find node_modules/babel-runtime/helpers/ -name "*.jsx") --standalone babelRuntime -d --outfile ${DIST}/lib/babel-runtime.js`)(),
    */
    buildAmpere(),
    buildAmpereReact(),
    
      // compile examples
      
      // TODO : 
      // -p [ css-modulesify --use cssnext --cssnext.sourcemap true --cssnext.browsers "> 5%" examples/\\1 --json ${DIST}/examples/\\1/css-modules.json --output ${DIST}/examples/\\1/index.css]
      // is not working yet since cssnext doesnt resolve css imports properly whenused as css-modulesify plugin
      // the brfs ignore option is a workaround for a bug in css-modulesify : https://github.com/substack/brfs/pull/51
      // as far as this bug is fixed we can update  css-modulesify and replace the github fork of brfs with its regular npm version
    pfy(`find examples -name "index.jsx" -print 
      | sed -rne 's:examples/(.*)/([^/]+\.jsx)$:mkdir -p ${DIST}/examples/\\1 \\&\\& ${BIN}/browserify & 
        --exclude orangevolt-ampere-ng 
        --exclude orangevolt-ampere-ng-react 
        --exclude react 
        --debug 
        -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative . ] 
        -t [ brfs --ignore "\\.(css)$"]
        -t [ browserify-shim ]
        --outfile ${DIST}/examples/\\1/index.js:p' 
      | sh
    `)(),
    
      // compile example css debug version
    pfy(`find examples -name "index.css" -print 
      | sed -rne 's:examples/(.*)/([^/]+).css$:${BIN}/cssnext & --sourcemap --browsers "> 5%" ${DIST}/examples/\\1/\\2.css:p' 
      | sh
    `)(),
    
      // compile example css production version
    pfy(`find examples -name "index.css" -print 
      | sed -rne 's:examples/(.*)/([^/]+).css$:${BIN}/cssnext & --compress --browsers "> 5%" ${DIST}/examples/\\1/\\2.min.css:p' 
      | sh
    `)(),

    Promise.all([
        // compile example css debug version
      pfy(`${BIN}/cssnext ./index.css --plugins [postcss-prefix-selector --prefix 'mdl *:not(no-mdl)'] --from ./index.css --to ${DIST}/lib --url "inline" --sourcemap --browsers "> 5%" ${DIST}/lib/${FILENAME}-development.css`)(),
        // compile example css production version
      pfy(`${BIN}/cssnext ./index.css --from ./index.css --to ${DIST}/lib --url "inline" --compress --browsers "> 5%" ${DIST}/lib/${FILENAME}.min.css`)()
    ]).then(()=>{
      return Promise.all([
        addPrefix(`${DIST}/lib/${FILENAME}-development.css`),
        addPrefix(`${DIST}/lib/${FILENAME}.min.css`)
      ])
    })    
  ])
  .then(()=>
    Promise.all([
        // minimize all js resources except react and browser-polyfill
      pfy(`find ${DIST} -name "*.js" ! -name '*.min.js' ! -name 'react*.js' ! -name 'react*.js' ! -name '*development.js' -print 
        | sed -rne 's:(.*).js$:${BIN}/uglifyjs & --stats --compress --mangle > \\1.min.js:p' 
        | sh
      `)()
      .then(()=>new Promise((resolve, reject)=>{
          // append header to all of our own generated js/css files
        gulp.src([`${DIST}/**/*.css`, `${DIST}/**/*.js`, `!${DIST}/lib/browser*.*`, `!${DIST}/lib/material*.*`, `!${DIST}/lib/react*.*`])
        .pipe(through2.obj(
          (file, enc, cb)=>(file.contents=new Buffer(HEADER + file.contents)) && cb(null, file)
        ))
        .pipe(gulp.dest(DIST))
        .on('finish',resolve)
        .on('reject',reject)
      }))
      .then(
        pfy(`find ${DIST} \\( -name "*.min.js" -o -name "*.min.css" -o -name "*.html" \\) -print 
          | sed -rne 's:(.*)$:gzip -9vc \\1 > \\1.gz:p' 
          | sh
        `)
      ),
        // compile html/css files for the examples
      pfy(globby, `${DIST}/examples/*`)().then(dirs=>
        dirs.map(dir=>{
          const //indexHtml = path.join(dir, 'index.html'), 
                indexCss  = path.join(dir, 'index.css'),
                IndexCssExists = (fs.accessSync ? fs.accessSync(indexCss, fs.F_OK) : fs.existsSync(indexCss))
          ;
          
          const mkHtml = (debug)=>{
            const developmentSuffix = debug ? '-development' : '.min';
            
            return `<!DOCTYPE html>
<html lang="en" ${debug ? '' : 'manifest="manifest.mf"'}>
<head>
  <meta charset="utf-8">
  <title>${PACKAGE.name} - example ${path.basename(dir)}</title>
  <link rel="stylesheet" href="../../lib/${FILENAME}${developmentSuffix}.css"></link>
  ${IndexCssExists ? '<link rel="stylesheet" href="index.css">' : ''}
  <script src="../../lib/browser-polyfill${developmentSuffix}.js"></script>
  <script src="../../lib/${REACT_FILENAME}${developmentSuffix}.js"></script>
  <script src="../../lib/${MDL_FILENAME}${developmentSuffix}.js"></script>
  <script src="../../lib/${AMPERE_FILENAME}${developmentSuffix}.js"></script>
  <script src="../../lib/${FILENAME}${developmentSuffix}.js"></script>
</head>
<body>
  <!-- page content goes here -->
  <div id="index"></div>
  <script src="index.js"></script>
  
  ${_serve.pingAlive.client()}
</body>
</html>`
            ;
          };
          
          //const html = (fs.accessSync ? fs.accessSync(indexHtml, fs.F_OK) : fs.existsSync(indexHtml)) ? fs.readFileSync(indexHtml).toString() : mkHtml();
          //fs.writeFileSync(indexHtml, html);
          
          fs.writeFileSync(path.join(dir, 'index.html'), mkHtml());
          fs.writeFileSync(path.join(dir, 'index-development.html'), mkHtml(true));
          
          fs.writeFileSync(path.join(dir, 'manifest.mf'), (()=>{
            return `CACHE MANIFEST
# ${new Date().toISOString()}, package ${FILENAME}

# Explicitly cached 'master entries'.
CACHE:
../../lib/${FILENAME}.min.css
${IndexCssExists ? 'index.css' : ''}
../../lib/browser-polyfill.min.js
../../lib/${REACT_FILENAME}.min.js
../../lib/${MDL_FILENAME}.min.js
../../lib/${AMPERE_FILENAME}.min.js
../../lib/${FILENAME}.min.js
index.js

# Resources that require the user to be online.
NETWORK:
*

# static.html will be served if main.py is inaccessible
# offline.jpg will be served in place of all images in images/large/
# offline.html will be served in place of all other .html files
FALLBACK:
#/main.py /static.html
#images/large/ images/offline.jpg
            `;
          })());
        })
      )
    ])
  )
});

gulp.task('build', ['compile']);

gulp.task('default', ['build']);
