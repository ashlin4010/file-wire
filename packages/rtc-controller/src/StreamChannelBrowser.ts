import * as EventEmitter from "events";
import * as stream from "stream";

enum StreamState {
    "FLOWING",
    "PAUSED",
    "STOPED"
}

export declare interface StreamSenderChannelBrowser {
    on(event: string, listener: Function): this;
    on(event: 'finish', listener: () => void): this;
    on(event: 'close', listener: (channel: StreamSenderChannelBrowser) => void): this;
}

export class StreamSenderChannelBrowser extends EventEmitter {
    channel: RTCDataChannel;
    id: number | null;
    label: string;
    state: StreamState;
    stream: ReadableStream;
    loop: Promise<any> | null = null;
    chunkSize = 16384;
    bufferLowThreshold = 16000000 * 0.80;

    constructor(rtcDataChannel: RTCDataChannel, stream: ReadableStream) {
        super();
        this.channel = rtcDataChannel;
        this.id = rtcDataChannel.id;
        this.label = rtcDataChannel.label;
        this.channel.addEventListener("close",  this.handelClose.bind(this));
        this.state = StreamState.PAUSED;
        this.stream = stream;
        this.channel.binaryType = "arraybuffer";

    }

    handelClose(event: Event): any {
        this.state = StreamState.STOPED;
        this.emit("close", this);
    }

    start(): Promise<void> {
        if(this.loop) return this.loop;
        this.state = StreamState.FLOWING;

        this.loop = new Promise(async (resolve, reject) => {
            let reader = this.stream.getReader();

            while (true) {
                if(await this.ableToSend()) {
                    if(this.channel.readyState === "open") {
                        let { done, value } = await reader.read();
                        if(done) break;

                        let chunked: Uint8Array[] = [];
                        let size = 128 * 1024;

                        Array.from({length: Math.ceil(value.byteLength / size)}, (val, i) => {
                            chunked.push(value.slice(i * size, i * size + size))
                        });

                        while (true) {
                            let chunk = chunked.shift();
                            if(await this.ableToSend()) {
                                if(chunk) this.channel.send(chunk);
                                else break;
                            } else break;
                        }
                    }
                } else {
                    this.state = StreamState.STOPED;
                    //await this.stream.cancel();
                    this.channel.close();
                    reject();
                    break;
                }
            }

            this.state = StreamState.STOPED;
            // this.stream.cancel();
            this.channel.close();
            resolve(undefined);
        });

        this.loop.then(() => {
            console.log("download complete");
        }).catch(() => {
            console.log("download aborted");
            if(this.channel.readyState === "open") this.channel.close();
        });
        return this.loop;
    }

    resume(): void {
        if(this.state === StreamState.STOPED) return;
        this.state = StreamState.FLOWING;
    }

    pause(): void {
        if(this.state === StreamState.STOPED) return;
        this.state = StreamState.PAUSED;
    }

    stop(): void {
        this.state = StreamState.STOPED;
    }

    ableToSend(): Promise<Boolean> {
        return new Promise<Boolean>(resolve => {
           let interval = setInterval(() => {
               // console.log("looping", this.channel.bufferedAmount, this.bufferLowThreshold, this.state);
               if(this.state == StreamState.STOPED) {
                   clearInterval(interval);
                   return resolve(false);
               }
               if (this.state == StreamState.FLOWING && this.channel.bufferedAmount < this.bufferLowThreshold) {
                   clearInterval(interval);
                   return resolve(true);
               }
           }, 0);
        });
    }
}