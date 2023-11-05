import crypto from 'node:crypto';
import Stream from 'node:stream';

import { File } from './';

export class InMemoryFile {
    protected _buffer: Buffer;

    public get contents() {
        if (!this._buffer) { throw new Error(); }
        return this._buffer.toString();
    }

    public get checksum() {
        return crypto
            .createHash('sha256')
            .update(this._buffer!)
            .digest('hex');
    }

    public validateChecksum(checksum: string) {
        return this.checksum === checksum;
    }

    public parseChecksum() {
        const contents = this.contents;
        if (!contents) { throw new Error(); }

        return contents.split(' ')[0];
    }

    public async decompress(location: string) {
        if (!this._buffer) { throw new Error(); }

        const gunzip = (await import('gunzip-maybe')).default;
        const extract = (await import('tar-stream')).extract();

        Stream.Readable
            .from(this._buffer)
            .pipe(gunzip())
            .pipe(extract);

        const files: File[] = [];

        for await (const entry of extract) {
            const file = new File({
                location: location,
                stream: entry
            });

            files.push(file);
            entry.resume();
        }

        return files;
    }

    constructor(buffer: Buffer) {
        this._buffer = buffer;
    }
}
