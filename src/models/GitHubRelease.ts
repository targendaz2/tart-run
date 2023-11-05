import type { RestEndpointMethodTypes } from '@octokit/rest';

import { GitHubAsset } from './';

type GetReleaseByTagResponse = RestEndpointMethodTypes['repos']['getReleaseByTag']['response'];

interface GitHubReleaseOptions {
    owner: string,
    repo: string,
    version: string,
}

export class GitHubRelease {
    private _owner: string;
    private _repo: string;
    private _version: string;
    private _release?: GetReleaseByTagResponse;

    private async init() {
        const octokit = (await import('../octokit.js')).octokit;
        this._release = await octokit.repos.getReleaseByTag({
            owner: this._owner,
            repo: this._repo,
            tag: this._version,
        });
    }

    async getAsset(name: string) {
        if (!this._release) { await this.init(); }
        if (!this._release) { throw new Error(); }

        const result = this._release.data.assets.find((asset) => asset.name === name);
        if (!result) { throw new Error(); }
        
        return new GitHubAsset({
            owner: this._owner,
            repo: this._repo,
            asset: result,
        }).init();
    }

    async downloadAsset(name: string) {
        const asset = await this.getAsset(name);
        return asset.download();
    }

    constructor(options: GitHubReleaseOptions) {
        this._owner = options.owner;
        this._repo = options.repo;
        this._version = options.version;
    }
}
