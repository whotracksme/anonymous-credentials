function _arrayToPtr(data, ptr) {
  if (data.length > GroupSignManager.BUFFER_SIZE) {
    throw new Error('Data size exceeded');
  }
  writeArrayToMemory(data, ptr);
  return ptr;
}

var initPromise = new Promise(function(resolve, reject) {
  var t = setTimeout(function() {
    reject(new Error('group-signer init timed out'));
  }, 30 * 1000);

  // Reject initialization after 30 seconds
  Module.postRun = (Module.postRun || []).concat(function() {
    clearTimeout(t);
    resolve();
  });
});

function GroupSignManager() {
  this.buffers = [];
  this._makeBindings();

  // Avoid storing state in Module heap
  this.stateSize = Module._GS_getStateSize();
  var state = Module._GS_createState();
  this._updateState(state);
  Module._GS_destroyState(state);
}

GroupSignManager.BUFFER_SIZE = 10 * 1024;

GroupSignManager.prototype._getBuffer = function() {
  // TODO: reduce the conservative upper bound BUFFER_SIZE
  const buffer = _malloc(GroupSignManager.BUFFER_SIZE);
  this.buffers.push(buffer);
  return buffer;
}

GroupSignManager.prototype._freeBuffers = function() {
  this.buffers.forEach(function(buffer) {
    _free(buffer);
  });
  this.buffers = [];
}

GroupSignManager.prototype._updateState = function(state) {
  // TODO: don't allocate every time
  this.state = (new Uint8Array(
    HEAPU8.buffer,
    state,
    this.stateSize
  )).slice();
}

GroupSignManager.prototype._makeBindings = function() {
  var self = this;
  function _(func, inputs, output, context) {
    inputs = inputs === undefined ? [] : inputs;
    output = output === undefined ? false : output;
    context = context === undefined ? true : context;

    return function() {
      try {
        var state = _arrayToPtr(self.state, self._getBuffer());
        var args = Array.prototype.slice.call(arguments);
        if (args.length !== inputs.length) {
          throw new Error('Args num mismatch');
        }
        if (!args.every(function(arg) { return arg instanceof Uint8Array; })) {
          throw new Error('Args must be Uint8Array');
        }

        var funcArgs = [];
        if (context) {
          funcArgs.push(state);
        }
        inputs.forEach(function(size, i) {
          if (size && args[i].length !== size) {
            throw new Error('Args size mismatch');
          }

          var ptr = _arrayToPtr(args[i], self._getBuffer());
          funcArgs.push(ptr);
          if (!size) {
            funcArgs.push(args[i].length);
          }
        });
        if (output === 'array') {
          var ptr = self._getBuffer();
          setValue(ptr, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);
        } else if (output === 'joinstatic') {
          var ptr = self._getBuffer();
          setValue(ptr, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);

          var ptr2 = self._getBuffer();
          setValue(ptr2, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr2 + 4);
          funcArgs.push(ptr2);
        }

        var res = Module[func].apply(Module, funcArgs);
        this._updateState(state);

        // TODO: we should probably have a way to check if there was an error for verify
        if (output === 'boolean') {
          return res === 1;
        } else {
          if (res !== 1) {
            throw new Error('Internal error');
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
        }
      } finally {
        this._freeBuffers();
      }
    }
  }

  this.seed = _('_GS_seed', [0]);
  this.setupGroup = _('_GS_setupGroup');
  this.getGroupPubKey = _('_GS_exportGroupPubKey', [], 'array');
  this.getGroupPrivKey = _('_GS_exportGroupPrivKey', [], 'array');
  this.getUserPrivKey = _('_GS_exportUserPrivKey', [], 'array');
  this.setGroupPubKey = _('_GS_loadGroupPubKey', [0]);
  this.setGroupPrivKey = _('_GS_loadGroupPrivKey', [0]);
  this.setUserPrivKey = _('_GS_loadUserPrivKey', [0]);
  this.startJoin = _('_GS_startJoin', [32], 'array');
  this.processJoin = _('_GS_processJoin', [0, 32], 'array');
  this.finishJoin = _('_GS_finishJoin', [0]);
  this.sign = _('_GS_sign', [32, 32], 'array');
  this.verify = _('_GS_verify', [32, 32, 0], 'boolean');
  this.getSignatureTag = _('_GS_getSignatureTag', [0], 'array', false);
  this.startJoinStatic = _('_GS_startJoinStatic', [32], 'joinstatic');
  this.finishJoinStatic = _('_GS_finishJoinStatic', [0, 0, 0], 'array', false);
}

Module.getGroupSigner = function () {
  return initPromise.then(function () {
    return GroupSignManager;
  });
}