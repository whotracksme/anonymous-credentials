const GroupSigner = require('bindings')('addon').GroupSigner;

// API compatibility with Emscripten modules
function initModule() {
  return {
    then(cb) {
      cb({ GroupSigner });
    }
  };
}

initModule.GroupSigner = GroupSigner;

module.exports = initModule;
