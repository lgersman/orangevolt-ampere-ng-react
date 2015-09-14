import React from 'react';
import { Ampere, Logger } from 'orangevolt-ampere-ng';

const fs = require('fs');

import Foo from './src/foo.jsx';
import Splash from './src/components/splash.jsx';
import App from './src/components/app.jsx';

const package_json = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, 'utf8'));

var exports = {
  Foo,
  App,
  Splash
};

Object.defineProperty(exports, 'VERSION', {
  value       : package_json.version,
  writable    : false,
  configurable: false
});

export default exports;

Logger(package_json.name).info(`version=${exports.VERSION}`);
