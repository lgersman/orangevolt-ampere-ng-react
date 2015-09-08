/*
  this module creates a preconfigured web server serving 
  the project directory
*/

const express    = require('express'),
      gzipStatic = require('connect-gzip-static'),
      serveIndex = require('serve-index')
;

import pingAlive from './task-serve-pingalive';

const serve = ({port=4000, middleware={pingAlive:{interval:2000,uriComponentToMatch:'ping-alive'}}}={})=>{
  const task = (done)=>{
    const app        = express();
    
    const server     = app
      .use(task.pingAlive)
      .use(serveIndex(__dirname, {'icons': true}))
      .use(gzipStatic(__dirname))
      .listen(port)
    ;
   
    //process.on('SIGTERM', server.close);
 }
 
 task.pingAlive = pingAlive({interval:middleware.pingAlive.interval});
 return task;
};

export default serve;
