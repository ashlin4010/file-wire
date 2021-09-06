import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import * as stream from "node:stream";
import {ReadWriteFileSystemInterface, Stats} from "./FileSystemInterface";
import {Buffer} from "buffer";
let Path = path;


export class LocalFileSystemInterface implements ReadWriteFileSystemInterface {

    rootPath: string;
    isReadOnly: boolean;

    constructor(rootPath: string) {
        this.rootPath = rootPath
        this.isReadOnly = false;
    }

    read(path: string, options: {offset: number, length: number}, callback?: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    read(path: string, options: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    read(path: string, options: any, callback?: (err: (Error | null), buffer?: ArrayBuffer) => void) {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }
        let offset: number = options?.offset | 0;
        let length = options?.length;

        if (callback) {
            fs.stat(this.safePath(path), (err, stats) => {
                if (err) callback!(err);
                else fs.open(this.safePath(path), "r", (err, fd) => {
                    if (err) callback!(err);
                    else {
                        let b = Buffer.alloc(length ? length : stats.size);
                        fs.read(fd, b, 0, length, offset, (err, bytesRead, buffer) => {
                            if (err) callback!(err);
                            else callback!(null, buffer);
                            fs.close(fd);
                        });
                    }
                });
            });
        }
    }

    createReadStream(path: string): stream.Readable {
        return fs.createReadStream(this.safePath(path));
    }

    createWriteStream(path: string): stream.Writable {
        return fs.createWriteStream(this.safePath(path));
    }

    readdir(path: string, callback: (err: (Error | null), files?: string[]) => void): void {
        fs.readdir(this.safePath(path), callback);
    }

    rename(oldPath: string, newPath: string, callback: (err: (Error | null)) => void): void {
        fs.rename(this.safePath(oldPath), this.safePath(newPath), callback);
    }

    rm(path: string, callback: (err: (Error | null)) => void): void {
        fs.rm(this.safePath(path), callback);
    }

    rmdir(path: string, callback: (err: (Error | null)) => void): void {
        fs.rmdir(this.safePath(path), {recursive: true}, callback);
    }

    stat(path: string, callback: (err: (Error | null), stats?: Stats) => void): void {
        let fileName = Path.parse(this.safePath(path)).base;
        fs.stat(this.safePath(path), (err, stats) => {
            if(err) callback(err);
            else {
                let newStats: Stats = {
                    name: fileName,
                    size: stats.size,
                    lastModified: stats.mtimeMs,
                    lastModifiedDate: stats.mtime,
                    type: mime.lookup(fileName),
                    isDirectory: stats.isDirectory()
                }
                callback(err, newStats);
            }
        });
    }

    safePath(unsafePath: string) {
        return path.join(this.rootPath, path.normalize(unsafePath).replace(/^(\.\.(\/|\\|$))+/, ''));
    }


}