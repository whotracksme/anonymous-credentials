const ModuleBuilder = require('./group-sign-bindings');

class GroupSignManager {
  _arrayToPtr(data) {
    const Module = this.instance;
    const ptr = Module._malloc(data.length * data.BYTES_PER_ELEMENT);
    Module.writeArrayToMemory(data, ptr);
    return ptr;
  }
  constructor() {
    this.instance = null;
  }
  init() {
    return new Promise((resolve, reject) => {
      try {
        const mymodule = { exports: null };
        this.instance = ModuleBuilder();
        this.instance.preRun = resolve;
      } catch (e) {
        reject(e);
      }
    });
  }
  seed(data) {
    const ptr = this._arrayToPtr(data);
    const ret = this.instance._JS_seed(ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
  setupGroup() {
    return this.instance._JS_setupGroup();
  }
  getGroupPubKey() {
    const instance = this.instance;
    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');
    let ret;
    if (instance._JS_exportGroupPubKey(ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(ptr);
    return ret;
  }
  getGroupPrivKey() {
    const instance = this.instance;
    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');
    let ret;
    if (instance._JS_exportGroupPrivKey(ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(ptr);
    return ret;
  }
  setGroupPubKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._JS_loadGroupPubKey(ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
  setGroupPrivKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._JS_loadGroupPrivKey(ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
  startJoin(challenge) {
    const instance = this.instance;
    const challengePtr = this._arrayToPtr(challenge);

    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');

    let ret;
    if (instance._JS_startJoin(challengePtr, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }

    this.instance._free(challengePtr);
    this.instance._free(ptr);
    return ret;
  }
  processJoin(joinMsg, challenge) {
    const instance = this.instance;
    const challengePtr = this._arrayToPtr(challenge);
    const joinMsgPtr = this._arrayToPtr(joinMsg);

    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');

    let ret;
    if (instance._JS_processJoin(joinMsgPtr, joinMsg.length, challengePtr, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }

    this.instance._free(challengePtr);
    this.instance._free(joinMsgPtr);
    this.instance._free(ptr);
    return ret;
  }
  finishJoin(joinResponse) {
    const instance = this.instance;
    const joinResponsePtr = this._arrayToPtr(joinResponse);
    const ret = instance._JS_finishJoin(joinResponsePtr, joinResponse.length);
    this.instance._free(joinResponsePtr);
    return ret;
  }
  sign(msg, bsn) {
    const instance = this.instance;
    const msgPtr = this._arrayToPtr(msg);
    const bsnPtr = this._arrayToPtr(bsn);

    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');

    let ret;
    if (instance._JS_sign(msgPtr, bsnPtr, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }

    this.instance._free(msgPtr);
    this.instance._free(bsnPtr);
    this.instance._free(ptr);
    return ret;
  }
  verify(msg, bsn, sig) {
    const instance = this.instance;
    const msgPtr = this._arrayToPtr(msg);
    const bsnPtr = this._arrayToPtr(bsn);
    const sigPtr = this._arrayToPtr(sig);

    const ret = instance._JS_verify(msgPtr, bsnPtr, sigPtr, sig.length);
    instance._free(msgPtr);
    instance._free(bsnPtr);
    instance._free(sigPtr);
    return ret;
  }

  getSignatureTag(sig) {
    const instance = this.instance;
    const sigPtr = this._arrayToPtr(sig);
    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');

    let ret;
    if (instance._JS_getSignatureTag(sigPtr, sig.length, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(sigPtr);
    instance._free(ptr);
    return ret;
  }

  getUserPrivKey() {
    const instance = this.instance;
    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');
    let ret;
    if (instance._JS_exportUserPrivKey(ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(ptr);
    return ret;
  }
  setUserPrivKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._JS_loadUserPrivKey(ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
}

module.exports = GroupSignManager;
