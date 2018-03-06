// API compatibility with emscripten
const GroupSigner = require('bindings')('addon').GroupSigner;

module.exports = {
    getGroupSigner: function() {
        return Promise.resolve(GroupSigner);
    },
    GroupSigner,
};
