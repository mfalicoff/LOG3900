/* eslint-disable */
const fs = require('fs-extra');

const srcDir = 'assets';
const destDir = 'out/assets';

try {
    fs.copySync(srcDir, destDir, { overwrite: true || false });
    console.log('success!');
} catch (err) {
    console.error(err);
}
