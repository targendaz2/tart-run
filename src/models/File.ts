import fs from 'node:fs';
import path from 'node:path';

import type tar from 'tar-stream';

export class File {
    private _name: string;
    private _location: string;

    public get name() {
        return this._name;
    }

    public get location() {
        return this._location;
    }

    public get path() {
        return path.resolve(this.location, this.name);
    }

    save(stream: tar.Entry) {
        if (!fs.existsSync(this.location)) {
            fs.mkdirSync(this.location, { recursive: true });
        }

        stream.pipe(fs.createWriteStream(this.path));
        return this;
    }

    constructor(options: { location: string, name: string });
    constructor(options: { location: string, stream: tar.Entry });
    constructor(options: { location: string, name?: string, stream?: tar.Entry }) {
        let name: string;

        if (options.name) {
            name = options.name;
        } else if (options.stream) {
            name = options.stream.header.name;
        } else {
            throw new Error();
        }

        const filePath = path.resolve(options.location, name);

        this._name = path.basename(filePath);
        this._location = path.dirname(filePath);

        if (options.stream) { this.save(options.stream); }
    }
}
