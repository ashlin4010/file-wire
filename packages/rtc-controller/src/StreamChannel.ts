import * as EventEmitter from "events";
import * as stream from "stream";

enum StreamState {
    "FLOWING",
    "PAUSED",
    "STOPED"
}

export declare interface StreamSenderChannel {
    on(event: string, listener: Function): this;
    on(event: 'finish', listener: () => void): this;
    on(event: 'close', listener: (channel: StreamSenderChannel) => void): this;
}

export class StreamSenderChannel extends EventEmitter {
    channel: RTCDataChannel;
    id: number | null;
    label: string;
    state: StreamState;
    stream: stream.Readable;
    loop: Promise<any> | null = null;
    chunkSize = 16384;
    bufferLowThreshold = 16000000 * 0.80;

    constructor(rtcDataChannel: RTCDataChannel, stream: stream.Readable) {
        super();
        this.channel = rtcDataChannel;
        this.id = rtcDataChannel.id;
        this.label = rtcDataChannel.label;
        this.channel.addEventListener("close",  this.handelClose.bind(this));
        this.state = StreamState.PAUSED;
        this.stream = stream;
        this.stream.pause();
        this.channel.binaryType = "arraybuffer";

        // if(this.channel.readyState === "open") {
        //     this.start();
        // }
    }

    handelClose(event: Event): any {
        this.state = StreamState.STOPED;
        this.emit("close", this);
    }

    start(): Promise<void> {
        if(this.loop) return this.loop;
        this.state = StreamState.FLOWING;
        this.loop = new Promise((resolve, reject) => {
            this.stream.on("readable", async () => {
                if(await this.ableToSend()) {
                    if(this.channel.readyState === "open") {
                        let chunk = this.stream.read();
                        if(chunk) this.channel.send(chunk);
                    }
                } else {
                    this.state = StreamState.STOPED;
                    this.stream.destroy();
                    reject();
                }
            });

            this.stream.on("end", () => {
                this.state = StreamState.STOPED;
                this.stream.destroy();
                this.channel.close();
                resolve(undefined);
            });
        });

        this.loop.then(() => {
            console.log("download complete");
        }).catch(() => {
            console.log("download aborted");
            if(this.channel.readyState === "open") this.channel.close();
            this.stream.destroy();
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
               //console.log("looping", this.channel.bufferedAmount, this.bufferLowThreshold)
               if(this.state == StreamState.STOPED) {
                   clearInterval(interval);
                   return resolve(false);
               }
               if (this.state == StreamState.FLOWING && this.channel.bufferedAmount < this.bufferLowThreshold) {
                   clearInterval(interval);
                   return resolve(true);
               }
           },2);
        });
    }
}