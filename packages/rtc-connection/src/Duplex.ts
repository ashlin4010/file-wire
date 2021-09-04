export type DataListener = (data: any) => void;
export type CloseListener = (code: number, reason: string) => void;


export enum DuplexState {
    OPEN,
    CLOSED
}

export declare interface Duplex {
    readonly state: DuplexState;
    write(data: any): void;

    on(event: 'data', listener: DataListener): this;
    on(event: 'close', listener: CloseListener): this;

    ondata?: DataListener | null;
    onclose?: CloseListener | null;
}