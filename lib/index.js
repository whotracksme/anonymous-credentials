const GroupSigner = require('bindings')('addon').GroupSigner;

// Keep API compatibility with Emscripten builds...
function getGroupSigner() {
  return Promise.resolve(GroupSigner);
}
// But also allow synchronous imports in NodeJS
getGroupSigner.GroupSigner = GroupSigner;

module.exports = getGroupSigner;
