import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { GitHubRelease, InMemoryFile } from './';

interface BinaryOptions {
    owner: string;
    repo: string;
    version: string;
}

export class Binary {
    private _name: string;
    private _version: string;
    private _release?: GitHubRelease;
    private _archive?: InMemoryFile;

    private _location: string = path.resolve(__dirname, '..', '..', 'bin');

    public get name() {
        return this._name;
    }

    public get version() {
        return this._version;
    }

    public get path() {
        return path.resolve(this._location, `${this.name}.app`, 'Contents', 'MacOS', this.name);
    }

    async download() {
        if (!this._release) { throw new Error(); }
        this._archive = await this._release.downloadAsset(`${this.name}.tar.gz`);
        const checksumFile = await this._release.downloadAsset(`${this.name}_${this.version}_checksums.txt`);

        const checksum = checksumFile.parseChecksum();
        if (!this._archive.validateChecksum(checksum)) {
            throw new Error();
        }
    }

    async install() {
        if (!this._archive) { await this.download(); }
        if (!this._archive) { throw new Error(); }

        const files = await this._archive.decompress(this._location);
        const binary = files.find((file) => file.name === this.name);
        if (!binary) { throw new Error(); }

        if (!this.path) { throw new Error(); }

        const perms = fs.constants.S_IRWXU | fs.constants.S_IRGRP | fs.constants.S_IXGRP | fs.constants.S_IROTH | fs.constants.S_IXOTH;

        fs.chmodSync(this.path, perms);
    }

    async run() {
        if (!this.path) { throw new Error(); }

        let command = this.path;

        if (process.argv.length > 2) {
            const args = process.argv;
            args.splice(0, 2);

            command += ' ' + args.join(' ');
        }

        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            } else if (stderr) {
                console.error(stderr);
                return;
            }

            console.log(stdout);
        });
    }

    
    constructor(options: BinaryOptions) {
        this._name = options.repo;
        this._version = options.version;

        if (process.argv[1].includes('install.js')) {
            this._release = new GitHubRelease({
                owner: options.owner,
                repo: this.name,
                version: this.version,
            });
        }
    }
}
