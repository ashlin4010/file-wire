let browserify = require('browserify');
let babelify = require("babelify");
let fs = require("fs");
let path = require('path');


try {
    fs.mkdirSync(path.join(__dirname, "dest"));
} catch (e) {}
fs.copyFileSync(path.join(__dirname, "src/index.html"), path.join(__dirname, "dest/index.html"));


browserify(path.join(__dirname, "src/index.js"))
    .transform(babelify, {
        global: true,
        plugins: ['@babel/plugin-transform-modules-commonjs', 'babel-plugin-transform-dynamic-imports-to-static-imports'],
        ignore: [/\/node_modules\/(?!browser-fs-access\/)/]
    })
    .bundle()
    .pipe(fs.createWriteStream(path.join(__dirname, 'dest/bundle.js')));