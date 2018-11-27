#!/usr/bin/env node

const toml = require('@iarna/toml');
const fs = require('fs');

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('usage: path/to/file.toml');
  return 1;
}

console.log(JSON.stringify(toml.parse(fs.readFileSync(args[0], 'utf8')), undefined, 2));
