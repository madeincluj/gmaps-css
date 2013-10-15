var fs = require('fs');
var parse = require('css-parse');

var file = fs.readFileSync('test.css', 'utf-8');
var css = parse(file);
console.log(JSON.stringify(css, null, 2));