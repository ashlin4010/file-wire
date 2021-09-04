"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFileSystemInterface = void 0;
var Path = require("path");
var web_streams_node_1 = require("web-streams-node");
var VirtualFileSystemInterface = /** @class */ (function () {
    function VirtualFileSystemInterface(fileSystemStructure) {
        this.isReadOnly = true;
        this.fss = fileSystemStructure || null;
    }
    VirtualFileSystemInterface.prototype.read = function (path, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }
        var offset = options === null || options === void 0 ? void 0 : options.offset;
        var length = options === null || options === void 0 ? void 0 : options.length;
        var end = length === undefined ? undefined : offset === undefined ? length : offset + length;
        if (callback) {
            path = Path.normalize(path);
            var fileObject = this.resolvePath(path, this.fss);
            if (!this.isFile(fileObject))
                callback(new Error("ENOENT: no such file or directory " + path), undefined);
            else
                fileObject.slice(offset, end).arrayBuffer()
                    .then(function (buffer) { return callback(null, buffer); })
                    .catch(function (error) { return callback(error); });
        }
    };
    VirtualFileSystemInterface.prototype.createReadStream = function (path) {
        path = Path.normalize(path);
        var fileObject = this.resolvePath(path, this.fss);
        if (this.isFile(fileObject))
            return (0, web_streams_node_1.toNodeReadable)(fileObject.stream());
        throw new Error("ENOENT: no such file or directory " + path);
    };
    VirtualFileSystemInterface.prototype.readdir = function (path, callback) {
        var err = null;
        path = Path.normalize(path);
        var fileObject = this.resolvePath(path, this.fss);
        if (!this.isDirectory(fileObject))
            err = new Error("ENOENT: no such file or directory " + path);
        callback(err, !err ? Object.keys(fileObject) : undefined);
    };
    VirtualFileSystemInterface.prototype.stat = function (path, callback) {
        var err = null;
        path = Path.normalize(path);
        var fileObject = this.resolvePath(path, this.fss);
        if (!this.isFile(fileObject) && !this.isDirectory(fileObject))
            err = new Error("ENOENT: no such file or directory " + path);
        var name = Path.parse(path).base;
        var stats;
        if (this.isFile(fileObject)) {
            stats = {
                name: name,
                size: fileObject.size,
                lastModified: fileObject.lastModified,
                lastModifiedDate: fileObject.lastModifiedDate,
                type: fileObject.type,
                isDirectory: false
            };
        }
        else {
            stats = {
                name: name,
                size: 0,
                lastModified: 0,
                lastModifiedDate: null,
                type: false,
                isDirectory: true
            };
        }
        callback(err, !err ? stats : undefined);
    };
    VirtualFileSystemInterface.prototype.cleanPath = function (path) {
        path = Path.normalize(path);
        if (path[path.length - 1] === "/")
            path = path.slice(0, path.length - 1);
        if (path.length > 1 && path[0] === "/")
            path = path.slice(1);
        return path;
    };
    VirtualFileSystemInterface.prototype.resolvePath = function (path, obj, separator) {
        if (separator === void 0) { separator = '/'; }
        if (path === "/" || path === "./")
            return obj;
        var properties = Array.isArray(path) ? path : this.cleanPath(path).split(separator);
        return properties.reduce(function (prev, curr) { return prev && prev[curr]; }, obj);
    };
    VirtualFileSystemInterface.prototype.isFile = function (object) {
        if (object === undefined)
            return false;
        if (object === null)
            return false;
        return (object.constructor != Object);
    };
    VirtualFileSystemInterface.prototype.isDirectory = function (object) {
        if (object === undefined)
            return false;
        if (object === null)
            return false;
        return (object.constructor == Object);
    };
    return VirtualFileSystemInterface;
}());
exports.VirtualFileSystemInterface = VirtualFileSystemInterface;
//# sourceMappingURL=VirtualFileSystemInterface.js.map