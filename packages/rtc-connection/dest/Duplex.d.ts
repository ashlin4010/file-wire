export declare type DataListener = (data: any) => void;
export declare type CloseListener = (code: number, reason: string) => void;
export declare enum DuplexState {
    OPEN = 0,
    CLOSED = 1
}
export declare interface Duplex {
    readonly state: DuplexState;
    write(data: any): void;
    on(event: 'data', listener: DataListener): this;
    on(event: 'close', listener: CloseListener): this;
    ondata?: DataListener | null;
    onclose?: CloseListener | null;
}
