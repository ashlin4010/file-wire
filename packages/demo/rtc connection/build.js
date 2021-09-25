let browserify = require('browserify');
let fs = require("fs");

try {
    fs.mkdirSync("./dest");
} catch (e) {}
fs.copyFileSync("./src/index.html", "./dest/index.html");

browserify("./src/index.js").bundle().pipe(fs.createWriteStream('./dest/bundle.js'));