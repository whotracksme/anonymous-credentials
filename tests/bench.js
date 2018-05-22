const expect = require('chai').expect;

const testModules = {
  native: '../lib/index',
  wasm: '../dist/group-sign-wasm',
  asmjs: '../dist/group-sign-asmjs',
};

function time(fn) {
  const t = Date.now();
  fn();
  return Date.now() - t;
}

function doTests(name, getGroupSigner) {
  function log(...args) {
    console.log(name, ...args);
  }
  const seed1 = new Uint8Array(128);
  const seed2 = new Uint8Array(128);

  for (let i = 0; i < 128; i += 1) {
    seed1[i] = i;
    seed2[i] = i + 1;
  }

  return getGroupSigner().then((s) => {
    GroupSigner = s.GroupSigner;

    const server = new GroupSigner();
    server.seed(seed1);
    server.setupGroup();

    const client = new GroupSigner();
    client.seed(seed2);
    const challenge = new Uint8Array(32);
    const { gsk, joinmsg } = client.startJoinStatic(challenge);
    const joinresp = server.processJoin(joinmsg, challenge);
    const credentials = client.finishJoinStatic(server.getGroupPubKey(), gsk, joinresp);
    client.setUserPrivKey(credentials);

    const N = 10;
    const msg = new Uint8Array(32);
    const bsn = new Uint8Array(32);
    let sig;
    log('[SIGN]', (time(() => {
      for (let i = 0; i < N; i += 1) {
        sig = client.sign(msg, bsn);
      }
    })) / N, 'ms');

    log('[VERIFY]', (time(() => {
      for (let i = 0; i < N; i += 1) {
        server.verify(msg, bsn, sig);
      }
    })) / N, 'ms');
  });
}


Object.keys(testModules).forEach((name) => {
  doTests(name, require(testModules[name]));
});
