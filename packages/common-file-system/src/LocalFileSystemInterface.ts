import * as fs from "fs";
import * as pfs from "fs/promises";
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
        this.rootPath = path.resolve(rootPath);
        this.isReadOnly = false;
    }

    read(path: string, options: {offset?: number, length?: number}): Promise<ArrayBuffer> {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);

        return new Promise<ArrayBuffer>((resolve, reject) => {
            let offset = options?.offset || 0;
            let length = options?.length;

            fs.stat(absolutePath, (err, stats) => {
                if (err) reject(err);
                else fs.open(absolutePath, "r", (err, fd) => {
                    if (err) reject(err);
                    else {
                        length = length || stats.size;
                        let b = Buffer.alloc(length ? length : stats.size);
                        fs.read(fd, b, 0, length, offset, (err, bytesRead, buffer) => {
                            if (err) reject(err);
                            else fs.close(fd, (err => {
                                if(err) reject(err);
                                else resolve(buffer);
                            }));
                        });
                    }
                });
            });
        });
    }

    createReadStream(path: string, options?: {highWaterMark: number, start: number, end: number}): stream.Readable {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);
        return fs.createReadStream(absolutePath, options);
    }

    createWriteStream(path: string): stream.Writable {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);
        return fs.createWriteStream(absolutePath);
    }

    readdir(path: string ): Promise<string[]> {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);
        return pfs.readdir(absolutePath);
    }

    rename(oldPath: string, newPath: string): Promise<void> {
        let relativePathOld = this.safePath(oldPath);
        let relativePathNew = this.safePath(newPath);
        let absolutePathOld = this.absolutePath(relativePathOld);
        let absolutePathNew = this.absolutePath(relativePathNew);
        return pfs.rename(absolutePathOld, absolutePathNew);
    }

    rm(path: string, options? : {recursive: boolean, force: boolean}): Promise<void> {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);
       return pfs.rm(absolutePath, options);
    }

    rmdir(path: string, options? : {recursive: boolean, force: boolean}): Promise<void> {
        let relativePath = this.safePath(path);
        let absolutePath = this.absolutePath(relativePath);
        return pfs.rmdir(absolutePath, options);
    }

    stat(path: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            let relativePath = this.safePath(path);
            let absolutePath = this.absolutePath(relativePath);

            let parsePath:any = Path.parse("/" + relativePath);
            parsePath.full = Path.join(parsePath.dir, parsePath.base);
            let name = parsePath.base;
            fs.stat(absolutePath, (err, stats) => {
                if(err) reject(err);
                else {
                    let newStats: any = {
                        name: name,
                        size: stats.size,
                        lastModified: stats.mtimeMs,
                        lastModifiedDate: stats.mtime,
                        type: mime.lookup(name),
                        isDirectory: stats.isDirectory(),
                        path: parsePath,
                    }
                    resolve(newStats);
                }
            });
        });
    }

    safePath(unsafePath: string) {
        return path.normalize(unsafePath).replace(/^(\.\.(\/|\\|$))+/, '');
    }

    absolutePath(relativePath: string) {
        return path.join(this.rootPath, relativePath);
    }

}