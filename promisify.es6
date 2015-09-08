/*
  little helper for promisifying everything we need
*/
const child_process = require( 'child_process');

const promisify = (arg,...params)=>
  ()=>{
    if (typeof(arg)==='string') {
      return params.length && promisify.spawn(arg, ...params) || promisify.exec(arg, ...params);
    } else if (typeof(arg)==='function') {
      return promisify.fn(arg, ...params);
    } else {
      Promise.reject(`Don't know how to handle argument ${arg}`);
    }
  }
;

  // promisifies js function calls following the node convention
promisify.fn = (fn, ...args)=>new Promise((resolve,reject)=>
  fn(...args, (err, res)=>(err && reject(err)) || resolve(res))
);

promisify.exec = cmd=>{
  return new Promise((resolve,reject)=>{
    cmd = cmd.replace(/\r|\n/g, ' ');
    promisify.VERBOSE && console.log(`[promisify.exec] "${cmd}"`);
    child_process.exec(cmd, (err, stdout, stderr)=>{
      if (err) {
        promisify.VERBOSE && console.error(`exited with code ${err}`);
        
        reject(stderr||stdout);        
      } else {
        promisify.VERBOSE && stdout && console.log(stdout);
        promisify.VERBOSE && stderr && console.log(stderr);
        resolve(stdout);
      }
    });
  });    
}

promisify.spawn = (program, options, ...args)=>{
  const spawnArgs = [program, args, options];

    // inject first argument (->options) into args if no options are given
  if (typeof(options)==='string') {
    args.unshift(spawnArgs.pop());
  }
  
  promisify.VERBOSE && console.log(`[promisify.spawn] "${[spawnArgs[0], spawnArgs[1]].join(' ')}" (=${JSON.stringify(spawnArgs)})`);  

  return new Promise((resolve,reject)=>{
    const proc   = child_process.spawn(...spawnArgs),
          stdout = [],
          stderr = []
    ;

    proc.stdout.on('data', chunk=> {
      stdout.push(chunk.toString());
      promisify.VERBOSE && console.log(chunk.toString());
    });

    proc.stderr.on('data', chunk=> {
      stderr.push(chunk.toString());
      promisify.VERBOSE && console.error(chunk.toString());
    });

    proc.stderr.on('close', code=>{
      if (code) {
        promisify.VERBOSE && console.error(`exited with code ${code} : ${stderr.join('')}`);
        reject(new Error(stderr.join('')));
      } else {  
        promisify.VERBOSE && stdout.length && console.error(stdout.join(''));
        resolve(stdout.join(''));
      }
    });
  });
};

export default promisify;
