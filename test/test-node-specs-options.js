import {Logger} from 'orangevolt-ampere-ng';

const VERBOSE = process.argv.some(item=>item==='-v'),
      DEBUG   = process.argv.some(item=>item==='-d');

if (DEBUG) {
  Logger.filter = /^.*/;
}

module.exports = {
    // An array of filenames, relative to current dir. These will be
    // executed, as well as any tests added with addSpecs()
  specs: [
    'test/foo.react-spec.js'
  ],
    // A function to call on completion.
    // function(passed)
  //onComplete: function(passed) { console.log('done!'); },
    // If true, display suite and spec names.
  isVerbose: VERBOSE,
    // If true, print colors to the terminal.
  showColors: true,
    // If true, include stack traces in failures.
  includeStackTrace: true,
    // Time to wait in milliseconds before a test automatically fails
  //defaultTimeoutInterval: 5000
};
