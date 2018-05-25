try {
  module.exports = require('./native');
} catch (e) {
  console.warn('[WARN]', 'Could not load groupsign native module, falling back to emscripten.');
  module.exports = require('./web');
}
