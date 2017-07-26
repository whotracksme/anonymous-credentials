const GroupSignManager = require('./group-sign-manager');

// Testing
const issuer = new GroupSignManager();
const verifier = new GroupSignManager();
const user = new GroupSignManager();

Promise.all([
  issuer.init(),
  verifier.init(),
  user.init(),
]).then(() => {
  const seed = new Uint8Array(128);
  seed[0] = 7;
  seed[127] = 254;
  issuer.seed(seed);
  issuer.setupGroup();
  const groupPubKey = issuer.getGroupPubKey();
  verifier.setGroupPrivKey(issuer.getGroupPrivKey());

  user.seed(seed);
  user.setGroupPubKey(groupPubKey);
  const challenge = new Uint8Array(32);
  challenge[0] = 7;
  challenge[31] = 31;
  challenge[1] = 8;
  const joinMessage = user.startJoin(challenge);
  const joinResponse = verifier.processJoin(joinMessage, challenge);
  user.finishJoin(joinResponse);

  // const sig = user.sign(challenge, challenge);
  const now = Date.now();
  const N = 100;
  const bsn = challenge.slice();
  bsn[0] = 5;
  bsn[1] = 6;
  bsn[2] = 7;
  verifier.seed(seed);
  console.log(verifier.setUserPrivKey(user.getUserPrivKey()));
  for (let i = 0; i < N; ++i) {
    console.log(issuer.verify(challenge, bsn, verifier.sign(challenge, bsn)));
  }
  console.log((Date.now() - now)/N);
  console.log(issuer.getGroupPrivKey().length);
  console.log(user.getUserPrivKey().length);
});
