const ModuleBuilder = require('./group-sign-bindings');

class GroupSignManager {
  static get BUFFER_SIZE() {
    return 10 * 1024;
  }

  constructor() {
    this.state = null;
    this.instance = null;
    this.buffers = [];
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
      this._makeBindings();
    });
  }
  unload() {
    if (this.state !== undefined) {
      this.buffers.forEach(buf => this.instance._free(buf));
      this.buffers = [];
      this.instance._GS_destroyState(this.state);
      delete this.state;
    }
  }

  _getBuffer(n) {
    if (n >= this.buffers.length) {
      this.buffers.push(this.instance._malloc(GroupSignManager.BUFFER_SIZE));
    }
    return this.buffers[n];
  }

  _arrayToPtr(data, ptr) {
    if (data.length > GroupSignManager.BUFFER_SIZE) {
      throw new Error('Data size exceeded');
    }
    this.instance.writeArrayToMemory(data, ptr);
    return ptr;
  }

  _makeBindings() {
    const _ = (func, inputs = [], output = false, context = true) => {
      return (...args) => {
        if (args.length !== inputs.length) {
          throw new Error('Args num mismatch');
        }
        if (!args.every(arg => arg instanceof Uint8Array)) {
          throw new Error('Args must be Uint8Array');
        }

        const funcArgs = [];
        if (context) {
          funcArgs.push(this.state);
        }
        inputs.forEach((size, i) => {
          if (size && args[i].length !== size) {
            throw new Error('Args size mismatch');
          }

          const ptr = this._arrayToPtr(args[i], this._getBuffer(i));
          funcArgs.push(ptr);
          if (!size) {
            funcArgs.push(args[i].length);
          }
        });
        if (output === 'array') {
          const ptr = this._getBuffer(inputs.length);
          this.instance.setValue(ptr, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);
        } else if (output === 'joinstatic') {
          const ptr = this._getBuffer(inputs.length);
          this.instance.setValue(ptr, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr + 4);
          funcArgs.push(ptr);

          const ptr2 = this._getBuffer(inputs.length + 1);
          this.instance.setValue(ptr2, GroupSignManager.BUFFER_SIZE - 4, 'i32');
          funcArgs.push(ptr2 + 4);
          funcArgs.push(ptr2);
        }

        const res = this.instance[func](...funcArgs);
        if (output === 'boolean') {
          return res === 1;
        } else if (output === 'joinstatic') {
          const ptrjoinmsg = funcArgs[funcArgs.length - 1];
          const ptrgsk = funcArgs[funcArgs.length - 3];
          const gsk = (new Uint8Array(
            this.instance.HEAPU8.buffer,
            ptrgsk + 4,
            this.instance.getValue(ptrgsk, 'i32')
          )).slice();
          const joinmsg = (new Uint8Array(
            this.instance.HEAPU8.buffer,
            ptrjoinmsg + 4,
            this.instance.getValue(ptrjoinmsg, 'i32')
          )).slice();
          return { gsk, joinmsg };
        } else if (output) {
          const ptr = funcArgs[funcArgs.length - 1];
          return (new Uint8Array(
            this.instance.HEAPU8.buffer,
            ptr + 4,
            this.instance.getValue(ptr, 'i32')
          )).slice();
        }

        if (res !== 1) {
          throw new Error('Internal error');
        }
      }
    };

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
}

module.exports = GroupSignManager;
