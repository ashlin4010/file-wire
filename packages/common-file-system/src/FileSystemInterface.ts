import * as stream from "node:stream";

export interface Stats {
    name: string;
    size: number;
    lastModified: number;
    lastModifiedDate: Date | null;
    type: string | false;
    isDirectory: boolean;
}

export interface ReadWriteFileSystemInterface extends ReadOnlyFileSystemInterface{
    readonly isReadOnly: boolean;
    rename(oldPath: string, newPath: string, callback: (err: Error | null,) => void): void;
    rmdir(path: string, callback: (err: Error | null) => void): void;
    rm(path: string, callback: (err: Error | null) => void): void;
    createWriteStream(path: string): stream.Writable;
}

export interface ReadOnlyFileSystemInterface {
    readdir(path: string, callback: (err: Error | null, files?: string[]) => void): void;
    stat(path: string, callback: (err: Error | null, stats?: Stats) => void): void;
    createReadStream(path: string): stream.Readable;

    read(path: string, options: {offset?: number, length?: number}, callback?: (err: Error | null, buffer?: ArrayBuffer) => void): void;
    read(path: string, options: any, callback?: (err: Error | null, buffer?: ArrayBuffer) => void): void;
}