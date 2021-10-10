import {ReadOnlyFileSystemInterface, Stats} from "./FileSystemInterface";
import * as stream from "node:stream";
import * as Path from "path";
import { toNodeReadable } from "web-streams-node";

interface FileSystemStructure {
    [name: string] : FileSystemStructure | File;
}

export class VirtualFileSystemInterface implements ReadOnlyFileSystemInterface {

    isReadOnly: boolean;
    fss: FileSystemStructure | null;

    constructor(fileSystemStructure?: FileSystemStructure) {
        this.isReadOnly = true;
        this.fss = fileSystemStructure || null;
    }

    read(path: string, options: {offset?: number, length?: number}): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let offset = options?.offset;
            let length = options?.length;
            let end = length === undefined ? undefined : offset === undefined ? length : offset + length;

            path = Path.normalize(path);
            let fileObject: unknown = this.resolvePath(path, this.fss);
            if (!this.isFile(fileObject)) reject(new Error("ENOENT: no such file or directory " + path));
            else (fileObject as File).slice(offset, end).arrayBuffer()
                .then(buffer => resolve(buffer))
                .catch(error =>reject(error))
            ;
        });
    }

    createReadStream(path: string): stream.Readable {
        path = Path.normalize(path);
        let fileObject: unknown = this.resolvePath(path, this.fss);
        if(this.isFile(fileObject)) return toNodeReadable((fileObject as File).stream());
        throw new Error("ENOENT: no such file or directory " + path);
    }

    readdir(path: string): Promise<string[]> {

        return new Promise((resolve, reject) => {
            let err = null;
            path = Path.normalize(path);
            let fileObject = this.resolvePath(path, this.fss);
            if(!this.isDirectory(fileObject)) err = new Error("ENOENT: no such file or directory " + path);

            if(err) reject(err);
            else resolve(Object.keys(fileObject));

        });
    }

    stat(path: string): Promise<Stats> {
        return new Promise((resolve, reject) => {
            let err = null;
            path = Path.normalize(path);
            let fileObject = this.resolvePath(path, this.fss);
            if(!this.isFile(fileObject) && !this.isDirectory(fileObject)) err = new Error("ENOENT: no such file or directory " + path);
            let parsePath:any = Path.parse("/" + path);
            parsePath.full = Path.join(parsePath.dir,parsePath.base);
            let name = parsePath.base;
            let stats: any;
            if(this.isFile(fileObject)){
                stats = {
                    name: name,
                    size: fileObject.size,
                    lastModified: fileObject.lastModified,
                    lastModifiedDate: fileObject.lastModifiedDate,
                    type: fileObject.type,
                    isDirectory: false,
                    path: parsePath,
                }
            } else {
                stats = {
                    name: name,
                    size: 0,
                    lastModified: 0,
                    lastModifiedDate: null,
                    type: false,
                    isDirectory: true,
                    path: parsePath,
                }
            }
            if(err) reject(err);
            else resolve(stats as Stats);
        });
    }

    cleanPath(path: string) {
        path = Path.normalize(path);
        if(path[path.length - 1] === "/") path = path.slice(0, path.length - 1);
        if(path.length > 1 && path[0] === "/") path = path.slice(1);
        return path;
    }

    resolvePath(path: string | string[], obj: any, separator = '/'): FileSystemStructure  {
        if(path === "/" || path === "./") return obj;
        const properties = Array.isArray(path) ? path : this.cleanPath(path).split(separator);
        return properties.reduce((prev, curr) => prev && prev[curr], obj);
    }

    isFile(object: any): boolean {
        if(object === undefined) return false;
        if(object === null) return false;
        return (object.constructor != Object);
    }

    isDirectory(object: any): boolean {
        if(object === undefined) return false;
        if(object === null) return false;
        return (object.constructor == Object);
    }

}