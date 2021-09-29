let browserify = require('browserify');
let fs = require("fs");
let path = require('path');

try {
    fs.mkdirSync(path.join(__dirname, "dest"));
} catch (e) {}
fs.copyFileSync(path.join(__dirname, "src/index.html") , path.join(__dirname, "dest/index.html"));

browserify(path.join(__dirname, "src/index.js")).bundle().pipe(fs.createWriteStream(path.join(__dirname, "dest/bundle.js")));