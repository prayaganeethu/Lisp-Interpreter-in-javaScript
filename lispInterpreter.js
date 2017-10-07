let lispI = require('./lispInterpret.js');

let fs = require('fs');

fs.readFile(process.argv[2], 'utf8', function(err, contents) {
   console.log(lispI.interpretLisp(contents));
});