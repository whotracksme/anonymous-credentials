module.exports = typeof WebAssembly !== 'undefined' ? require('./wasm') : require('asmjs');
