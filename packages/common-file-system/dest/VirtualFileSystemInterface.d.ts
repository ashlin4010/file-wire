/// <reference types="node" />
import { ReadOnlyFileSystemInterface, Stats } from "./FileSystemInterface";
import * as stream from "node:stream";
interface FileSystemStructure {
    [name: string]: FileSystemStructure | File;
}
export declare class VirtualFileSystemInterface implements ReadOnlyFileSystemInterface {
    isReadOnly: boolean;
    fss: FileSystemStructure | null;
    constructor(fileSystemStructure?: FileSystemStructure);
    read(path: string, options: {
        offset?: number;
        length?: number;
    }, callback?: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    read(path: string, options: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    createReadStream(path: string): stream.Readable;
    readdir(path: string, callback: (err: (Error | null), files?: string[]) => void): void;
    stat(path: string, callback: (err: (Error | null), stats?: Stats) => void): void;
    cleanPath(path: string): string;
    resolvePath(path: string | string[], obj: any, separator?: string): FileSystemStructure;
    isFile(object: any): boolean;
    isDirectory(object: any): boolean;
}
export {};
