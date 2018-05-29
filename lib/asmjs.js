'use strict';
const { initModule } = require('./util');

module.exports = function getGroupSigner() {
  if (!getGroupSigner._initPromise) {
    getGroupSigner._initPromise = initModule(require('../dist/group-sign-asmjs'));
  }
  return getGroupSigner._initPromise.then((GroupSigner) => {
    getGroupSigner.GroupSigner = GroupSigner;
    return GroupSigner;
  });
};
