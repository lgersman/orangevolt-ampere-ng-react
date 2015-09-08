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

gulp.task('prepare', ['clean'], ()=>
  pfy(`mkdir -p ${DIST}/lib`)()
  .then(()=>Promise.all([
    pfy(`cp node_modules/babel-core/browser-polyfill.js ${DIST}/lib/browser-polyfill-development.js`)(),
    pfy(`cp node_modules/babel-core/browser-polyfill.min.js ${DIST}/lib/browser-polyfill.min.js`)(),
    copyReact(),
    pfy(`rsync -av --exclude '*.css' --exclude '*.js' --exclude '*.jsx' examples/* ${DIST}/examples`)
  ]))
);

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

const copyReact = ()=>Promise.all([
  pfy(`cp node_modules/react/dist/react.js ${DIST}/lib/${REACT_FILENAME}-development.js`)(),
  pfy(`cp node_modules/react/dist/react.min.js ${DIST}/lib/${REACT_FILENAME}.min.js`)(),
  pfy(`cp node_modules/react/dist/react-with-addons.js ${DIST}/lib/${REACT_FILENAME}-with-addons-development.js`)(),
  pfy(`cp node_modules/react/dist/react-with-addons.min.js ${DIST}/lib/${REACT_FILENAME}-with-addons.min.js`)()
]);

gulp.task('compile', ['prepare'], ()=>
  Promise.all([
    /*
    pfy(`cp node_modules/babel-core/browser.js node_modules/babel-core/browser.min.js ${DIST}/lib`)(),
    pfy(`rsync -av --exclude '*.less' --exclude '*.es6' --exclude '*.jsx' src/* ${DIST}/src`)(),
    pfy(fs.writeFile, `${DIST}/index.js`, `${babel.buildExternalHelpers()}`)(),
    pfy(`${BIN}/browserify node_modules/babel-runtime/node_modules/core-js/index.js node_modules/babel-runtime/regenerator/index.js $(find node_modules/babel-runtime/helpers/ -name "*.jsx") --standalone babelRuntime -d --outfile ${DIST}/lib/babel-runtime.js`)(),
    */
    buildAmpere(),
    buildAmpereReact(),
    
      // compile examples
    pfy(`find examples -name "index.jsx" -print 
      | sed -rne 's:examples/(.*)/([^/]+\.jsx)$:mkdir -p ${DIST}/examples/\\1 \\&\\& ${BIN}/browserify & 
        --exclude orangevolt-ampere-ng 
        --exclude orangevolt-ampere-ng-react 
        --exclude react 
        --debug 
        -t [ babelify --stage 0 --plugins typecheck --sourceMapRelative . ] 
        -t [ brfs ]
        -t [ browserify-shim ]
        --outfile ${DIST}/examples/\\1/index.js:p' 
      | sh
    `)(),
    
      // compile css debug version
    pfy(`find examples -name "index.css" -print 
      | sed -rne 's:examples/(.*)/([^/]+).css$:${BIN}/cssnext & --sourcemap --browsers "> 5%" ${DIST}/examples/\\1/\\2.css:p' 
      | sh
    `)(),
    
      // compile css production version
    pfy(`find examples -name "index.css" -print 
      | sed -rne 's:examples/(.*)/([^/]+).css$:${BIN}/cssnext & --compress --browsers "> 5%" ${DIST}/examples/\\1/\\2.min.css:p' 
      | sh
    `)()
  ])
  .then(()=>
    Promise.all([
        // minimize all js/css resources except react and browser-polyfill
      pfy(`find ${DIST} -name "*.js" ! -name '*.min.js' ! -name 'react*.js' ! -name '*development.js' -print 
        | sed -rne 's:(.*).js$:${BIN}/uglifyjs & --stats --compress --mangle > \\1.min.js:p' 
        | sh
      `)()
      .then(()=>new Promise((resolve, reject)=>{
          // append header to all js/css files
        gulp.src([`${DIST}/**/*.css`, `${DIST}/**/*.js`, `!${DIST}/*.js`])
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
          const indexHtml = path.join(dir, 'index.html'), 
                indexCss  = path.join(dir, 'index.css'),
                IndexCssExists = (fs.accessSync ? fs.accessSync(indexCss, fs.F_OK) : fs.existsSync(indexCss))
          ;
          
          const mkHtml = (debug)=>{
            debug = debug ? '-development' : '.min';
            
            return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${PACKAGE.name} - example ${path.basename(dir)}</title>
  ${IndexCssExists ? '<link rel="stylesheet" href="index.css">' : 'nope'}
  <script src="../../lib/browser-polyfill${debug}.js"></script>
  <script src="../../lib/${REACT_FILENAME}${debug}.js"></script>
  <script src="../../lib/${AMPERE_FILENAME}${debug}.js"></script>
  <script src="../../lib/${FILENAME}${debug}.js"></script>
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
        })
      )
    ])
  )
);

gulp.task('build', ['compile']);

gulp.task('default', ['build']);
