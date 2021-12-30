// This limits the size of the Uint8Array inputs.
// For example, in sign() operation both msg and bsn
// length must not be greater than BUFFER_SIZE
var BUFFER_SIZE = 10 * 1024;

function _arrayToPtr(data, ptr) {
  if (data.length > BUFFER_SIZE) {
    throw new Error('Data size exceeded');
  }
  writeArrayToMemory(data, ptr);
  return ptr;
}

function GroupSigner() {
  this.buffers = [];
  this._makeBindings();

  // Avoid storing state in Module heap
  this.stateSize = Module._GS_getStateSize();
  var state = Module._malloc(this.stateSize);
  Module._GS_initState(state);
  this._updateState(state);
  _free(state);
}

function initStaticMembers() {
  GroupSigner._version = UTF8ToString(Module._GS_version());
  GroupSigner._curve = UTF8ToString(Module._GS_curve());
}

if (Module['calledRun']) {
    initStaticMembers();
  } else {
    var old = Module['onRuntimeInitialized'];
    Module['onRuntimeInitialized'] = function() {
      if (old) old();
      initStaticMembers();
    };
}


GroupSigner.prototype._getBuffer = function() {
  // TODO: reduce the conservative upper bound BUFFER_SIZE
  const buffer = Module._malloc(BUFFER_SIZE);
  this.buffers.push(buffer);
  return buffer;
}

GroupSigner.prototype._freeBuffers = function() {
  this.buffers.forEach(function(buffer) {
    _free(buffer);
  });
  this.buffers = [];
}

GroupSigner.prototype._updateState = function(state) {
  // TODO: don't allocate every time
  this.state = (new Uint8Array(
    HEAPU8.buffer,
    state,
    this.stateSize
  )).slice();
}

GroupSigner.prototype._makeBindings = function() {
  var self = this;
  function _(func, inputs, output, context) {
    inputs = inputs === undefined ? 0 : inputs;
    output = output === undefined ? false : output;
    context = context === undefined ? true : context;

    return function() {
      try {
        var state = _arrayToPtr(self.state, self._getBuffer());
        var args = Array.prototype.slice.call(arguments);
        if (args.length !== inputs) {
          throw new Error('expected ' + inputs + ' arguments');
        }
        if (!args.every(function(arg) { return arg instanceof Uint8Array; })) {
          throw new Error('input data must be uint8array');
        }

        var funcArgs = [];
        if (context) {
          funcArgs.push(state);
        }
        for (var i = 0; i < inputs; ++i) {
          var ptr = _arrayToPtr(args[i], self._getBuffer());
          funcArgs.push(ptr);
          funcArgs.push(args[i].length);
        }
        if (output === 'array') {
          var ptr = self._getBuffer();
          setValue(ptr, BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);
        } else if (output === 'joinstatic') {
          var ptr = self._getBuffer();
          setValue(ptr, BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);

          var ptr2 = self._getBuffer();
          setValue(ptr2, BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr2 + 4);
          funcArgs.push(ptr2);
        }

        var res = Module[func].apply(Module, funcArgs);
        this._updateState(state);

        // TODO: we should probably have a way to check if there was an error for verify
        if (output === 'boolean') {
          if (res === Module._GS_success()) {
            return true;
          } else if (res === Module._GS_failure()) {
            return false;
          }
        }
        if (res !== Module._GS_success()) {
          throw new Error(UTF8ToString(Module._GS_error(res)));
        }
        if (output === 'joinstatic') {
          var ptrjoinmsg = funcArgs[funcArgs.length - 1];
          var ptrgsk = funcArgs[funcArgs.length - 3];
          var gsk = (new Uint8Array(
            HEAPU8.buffer,
            ptrgsk + 4,
            getValue(ptrgsk, 'i32')
          )).slice();
          var joinmsg = (new Uint8Array(
            HEAPU8.buffer,
            ptrjoinmsg + 4,
            getValue(ptrjoinmsg, 'i32')
          )).slice();
          return { gsk: gsk, joinmsg: joinmsg };
        } else if (output) {
          var ptr = funcArgs[funcArgs.length - 1];
          return (new Uint8Array(
            HEAPU8.buffer,
            ptr + 4,
            getValue(ptr, 'i32')
          )).slice();
        }
      } finally {
        this._freeBuffers();
      }
    }
  }

  this.seed = _('_GS_seed', 1);
  this.setupGroup = _('_GS_setupGroup');
  this.getGroupPubKey = _('_GS_exportGroupPubKey', 0, 'array');
  this.getGroupPrivKey = _('_GS_exportGroupPrivKey', 0, 'array');
  this.getUserCredentials = _('_GS_exportUserCredentials', 0, 'array');
  this.setGroupPubKey = _('_GS_loadGroupPubKey', 1);
  this.setGroupPrivKey = _('_GS_loadGroupPrivKey', 1);
  this.setUserCredentials = _('_GS_loadUserCredentials', 1);
  this.processJoin = _('_GS_processJoin', 2, 'array');
  this.sign = _('_GS_sign', 2, 'array');
  this.verify = _('_GS_verify', 3, 'boolean');
  this.getSignatureTag = _('_GS_getSignatureTag', 1, 'array', false);
  this.startJoin = _('_GS_startJoin', 1, 'joinstatic');
  this.finishJoin = _('_GS_finishJoin', 3, 'array', false);
}

Module.GroupSigner = GroupSigner;
