const GroupSigner = require('bindings')('groupsign').GroupSigner;

// Keep API compatibility with Emscripten builds...
function getGroupSigner() {
  return Promise.resolve(GroupSigner);
}
// but also allow synchronous imports in NodeJS
getGroupSigner.GroupSigner = GroupSigner;

module.exports = getGroupSigner;
