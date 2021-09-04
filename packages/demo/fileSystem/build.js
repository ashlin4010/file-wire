let browserify = require('browserify');
let babelify = require("babelify");
let fs = require("fs");


try {
    fs.mkdirSync("./dest");
} catch (e) {}
fs.copyFileSync("./src/index.html", "./dest/index.html");


browserify("./src/index.js")
    .transform(babelify, {
        global: true,
        plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-transform-dynamic-imports-to-static-imports'],
        ignore: [/\/node_modules\/(?!browser-fs-access\/)/]
    })
    .bundle()
    .pipe(fs.createWriteStream('./dest/bundle.js'));