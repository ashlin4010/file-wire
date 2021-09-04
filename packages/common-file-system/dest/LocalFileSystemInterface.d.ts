/// <reference types="node" />
import * as stream from "node:stream";
import { ReadWriteFileSystemInterface, Stats } from "./FileSystemInterface";
export declare class LocalFileSystemInterface implements ReadWriteFileSystemInterface {
    rootPath: string;
    isReadOnly: boolean;
    constructor(rootPath: string);
    read(path: string, options: {
        offset: number;
        length: number;
    }, callback?: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    read(path: string, options: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    createReadStream(path: string): stream.Readable;
    createWriteStream(path: string): stream.Writable;
    readdir(path: string, callback: (err: (Error | null), files?: string[]) => void): void;
    rename(oldPath: string, newPath: string, callback: (err: (Error | null)) => void): void;
    rm(path: string, callback: (err: (Error | null)) => void): void;
    rmdir(path: string, callback: (err: (Error | null)) => void): void;
    stat(path: string, callback: (err: (Error | null), stats?: Stats) => void): void;
    safePath(unsafePath: string): string;
}
