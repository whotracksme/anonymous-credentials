// API compatibility with emscripten
module.exports = {
    getGroupSigner: function() {
        return Promise.resolve(require('bindings')('addon').GroupSigner);
    }
};