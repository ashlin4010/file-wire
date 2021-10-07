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
        this.rootPath = rootPath
        this.isReadOnly = false;
    }

    read(path: string, options: {offset?: number, length?: number}): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            let offset = options?.offset || 0;
            let length = options?.length;

            fs.stat(this.safePath(path), (err, stats) => {
                if (err) reject(err);
                else fs.open(this.safePath(path), "r", (err, fd) => {
                    if (err) reject(err);
                    else {
                        length = length || stats.size;
                        let b = Buffer.alloc(length ? length : stats.size);
                        fs.read(fd, b, 0, length, offset, (err, bytesRead, buffer) => {
                            if (err) reject(err);
                            else resolve(buffer);
                            fs.close(fd);
                        });
                    }
                });
            });
        });
    }



    createReadStream(path: string): stream.Readable {
        return fs.createReadStream(this.safePath(path));
    }

    createWriteStream(path: string): stream.Writable {
        return fs.createWriteStream(this.safePath(path));
    }

    readdir(path: string ): Promise<string[]> {
        return pfs.readdir(this.safePath(path));
    }

    rename(oldPath: string, newPath: string): Promise<void> {
        return pfs.rename(this.safePath(oldPath), this.safePath(newPath));
    }

    rm(path: string, options? : {recursive: boolean, force: boolean}): Promise<void> {
       return pfs.rm(this.safePath(path), options);
    }

    rmdir(path: string, options? : {recursive: boolean, force: boolean}): Promise<void> {
        return pfs.rmdir(this.safePath(path), options);
    }

    stat(path: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            path = this.safePath(path);
            let parsePath:any = Path.parse(path);
            parsePath.full = path;
            let name = parsePath.base;
            fs.stat(this.safePath(path), (err, stats) => {
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
        return path.join(this.rootPath, path.normalize(unsafePath).replace(/^(\.\.(\/|\\|$))+/, ''));
    }

}