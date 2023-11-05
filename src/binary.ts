// @ts-ignore
import { version } from '../package.json';
import * as config from './config.json';
import { Binary } from './models';

const binary = new Binary({
    owner: config.owner,
    repo: config.repo,
    version: version,
});

export default binary;
