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
    rename(oldPath: string, newPath: string): Promise<void>;
    rmdir(path: string, options? : {recursive: boolean, force: boolean}): Promise<void>;
    rm(path: string, options? : {recursive: boolean, force: boolean}): Promise<void>;
    createWriteStream(path: string): stream.Writable;
}

export interface ReadOnlyFileSystemInterface {
    readdir(path: string): Promise<string[]>;
    stat(path: string): Promise<Stats>;
    createReadStream(path: string, options?: {highWaterMark: number, start: number, end: number}): stream.Readable;

    read(path: string, options: {offset?: number, length?: number}, callback?: (err: Error | null, buffer?: Uint8Array) => void): void;
    read(path: string, options: any, callback?: (err: Error | null, buffer?: Uint8Array) => void): void;


    read(path: string, options: {offset?: number, length?: number}): Promise<ArrayBuffer>;


}