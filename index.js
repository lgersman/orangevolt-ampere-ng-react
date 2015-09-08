import React from 'react';
import { Ampere, Logger } from 'orangevolt-ampere-ng';

const fs = require('fs');

import Foo from './src/foo.jsx';

const package_json = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, 'utf8'));

var exports = {
  Foo
};

Object.defineProperty(exports, 'VERSION', {
  value       : package_json.version,
  writable    : false,
  configurable: false
});

export default exports;

Logger(package_json.name).info(`version=${exports.VERSION}`);
