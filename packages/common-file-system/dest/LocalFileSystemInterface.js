"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileSystemInterface = void 0;
var fs = require("fs");
var path = require("path");
var mime = require("mime-types");
var buffer_1 = require("buffer");
var Path = path;
var LocalFileSystemInterface = /** @class */ (function () {
    function LocalFileSystemInterface(rootPath) {
        this.rootPath = rootPath;
        this.isReadOnly = false;
    }
    LocalFileSystemInterface.prototype.read = function (path, options, callback) {
        var _this = this;
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }
        var offset = (options === null || options === void 0 ? void 0 : options.offset) | 0;
        var length = options === null || options === void 0 ? void 0 : options.length;
        if (callback) {
            fs.stat(this.safePath(path), function (err, stats) {
                if (err)
                    callback(err);
                else
                    fs.open(_this.safePath(path), "r", function (err, fd) {
                        if (err)
                            callback(err);
                        else {
                            var b = buffer_1.Buffer.alloc(length ? length : stats.size);
                            fs.read(fd, b, 0, length, offset, function (err, bytesRead, buffer) {
                                if (err)
                                    callback(err);
                                else
                                    callback(null, buffer);
                                fs.close(fd);
                            });
                        }
                    });
            });
        }
    };
    LocalFileSystemInterface.prototype.createReadStream = function (path) {
        return fs.createReadStream(this.safePath(path));
    };
    LocalFileSystemInterface.prototype.createWriteStream = function (path) {
        return fs.createWriteStream(this.safePath(path));
    };
    LocalFileSystemInterface.prototype.readdir = function (path, callback) {
        fs.readdir(this.safePath(path), callback);
    };
    LocalFileSystemInterface.prototype.rename = function (oldPath, newPath, callback) {
        fs.rename(this.safePath(oldPath), this.safePath(newPath), callback);
    };
    LocalFileSystemInterface.prototype.rm = function (path, callback) {
        fs.rm(this.safePath(path), callback);
    };
    LocalFileSystemInterface.prototype.rmdir = function (path, callback) {
        fs.rmdir(this.safePath(path), callback);
    };
    LocalFileSystemInterface.prototype.stat = function (path, callback) {
        var fileName = Path.parse(this.safePath(path)).base;
        fs.stat(this.safePath(path), function (err, stats) {
            if (err)
                callback(err);
            else {
                var newStats = {
                    name: fileName,
                    size: stats.size,
                    lastModified: stats.mtimeMs,
                    lastModifiedDate: stats.mtime,
                    type: mime.lookup(fileName),
                    isDirectory: stats.isDirectory()
                };
                callback(err, newStats);
            }
        });
    };
    LocalFileSystemInterface.prototype.safePath = function (unsafePath) {
        return path.join(this.rootPath, path.normalize(unsafePath).replace(/^(\.\.(\/|\\|$))+/, ''));
    };
    return LocalFileSystemInterface;
}());
exports.LocalFileSystemInterface = LocalFileSystemInterface;
//# sourceMappingURL=LocalFileSystemInterface.js.map