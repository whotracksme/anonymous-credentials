const getGroupSigner = require('./common');

module.exports = () => getGroupSigner(require('../dist/group-sign-wasm'));
