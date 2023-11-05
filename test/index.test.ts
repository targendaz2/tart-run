import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';

describe('tart installation package', function () {
    it('installs tart locally', function () {
        const bin = path.join(__dirname, '..', 'node_modules/.bin/tart');

        cp.spawnSync('npm run postinstall');
        
        expect(fs.existsSync(bin)).to.be.true;
    });
});
