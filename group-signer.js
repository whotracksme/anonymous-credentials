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
    const p = new Promise((resolve, reject) => {
      try {
        const mymodule = { exports: null };
        this.instance = ModuleBuilder();
        this.instance.preRun = resolve;
      } catch (e) {
        reject(e);
      }
    });
    return p.then(() => {
      this.state = this.instance._GS_createState();
    });
  }
  unload() {
    if (this.state !== undefined) {
      this.instance._GS_destroyState(this.state);
      delete this.state;
    }
  }
  seed(data) {
    const ptr = this._arrayToPtr(data);
    const ret = this.instance._GS_seed(this.state, ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
  setupGroup() {
    return this.instance._GS_setupGroup(this.state);
  }
  getGroupPubKey() {
    const instance = this.instance;
    const bytes = 10*1024;
    const ptr = instance._malloc(bytes);
    instance.setValue(ptr, bytes - 4, 'i32');
    let ret;
    if (instance._GS_exportGroupPubKey(this.state, ptr + 4, ptr) === 1) {
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
    if (instance._GS_exportGroupPrivKey(this.state, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(ptr);
    return ret;
  }
  setGroupPubKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._GS_loadGroupPubKey(this.state, ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
  setGroupPrivKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._GS_loadGroupPrivKey(this.state, ptr, data.length);
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
    if (instance._GS_startJoin(this.state, challengePtr, ptr + 4, ptr) === 1) {
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
    if (instance._GS_processJoin(this.state, joinMsgPtr, joinMsg.length, challengePtr, ptr + 4, ptr) === 1) {
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
    const ret = instance._GS_finishJoin(this.state, joinResponsePtr, joinResponse.length);
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
    if (instance._GS_sign(this.state, msgPtr, bsnPtr, ptr + 4, ptr) === 1) {
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

    const ret = instance._GS_verify(this.state, msgPtr, bsnPtr, sigPtr, sig.length);
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
    if (instance._GS_getSignatureTag(sigPtr, sig.length, ptr + 4, ptr) === 1) {
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
    if (instance._GS_exportUserPrivKey(this.state, ptr + 4, ptr) === 1) {
      const size = instance.getValue(ptr, 'i32');
      ret = (new Uint8Array(instance.HEAPU8.buffer, ptr + 4, size)).slice();
    }
    instance._free(ptr);
    return ret;
  }
  setUserPrivKey(data) {
    const instance = this.instance;
    const ptr = this._arrayToPtr(data);
    const ret = instance._GS_loadUserPrivKey(this.state, ptr, data.length);
    this.instance._free(ptr);
    return ret;
  }
}

module.exports = GroupSignManager;
