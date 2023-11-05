import type { RestEndpointMethodTypes } from '@octokit/rest';

import { InMemoryFile } from './';

type AssetResponse = RestEndpointMethodTypes['repos']['getReleaseByTag']['response']['data']['assets'][0];

interface GitHubAssetOptions {
    owner: string,
    repo: string,
    asset: AssetResponse,
}

export class GitHubAsset {
    private _owner: string;
    private _repo: string;
    private _asset: AssetResponse;
    private _buffer?: Buffer;

    public async init() {
        const octokit = (await import('../octokit.js')).octokit;
        const result = await octokit.repos.getReleaseAsset({
            owner: this._owner,
            repo: this._repo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            asset_id: this._asset.id,
            headers: { accept: 'application/octet-stream' },
        });

        // @ts-expect-error
        const arrayBuffer = <ArrayBuffer>result.data;
        this._buffer = Buffer.from(arrayBuffer);
        return this;
    }

    public download() {
        if (!this._buffer) { throw new Error(); }
        return new InMemoryFile(this._buffer);
    }

    constructor(options: GitHubAssetOptions) {
        this._owner = options.owner;
        this._repo = options.repo;
        this._asset = options.asset;
    }
}
