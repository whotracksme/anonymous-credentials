const { initModule } = require('./util');

module.exports = function getGroupSigner() {
  getGroupSigner._initPromise = initModule(require('../dist/group-sign-wasm'));
  return getGroupSigner._initPromise.then((GroupSigner) => {
    getGroupSigner.GroupSigner = GroupSigner;
    return GroupSigner;
  });
};
