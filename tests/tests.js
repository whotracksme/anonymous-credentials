'use strict';
const expect = require('chai').expect;
const crypto = require('crypto');

const testModules = {
  auto: '../lib/index',
  wasm: '../lib/wasm',
  asmjs: '../lib/asmjs',
  native: '../lib/native',
  web: '../lib/web',
};

function doTests(name, moduleName) {
  const seed1 = new Uint8Array(128);
  const seed2 = new Uint8Array(128);

  for (let i = 0; i < 128; i += 1) {
    seed1[i] = i;
    seed2[i] = i + 1;
  }
  describe('GroupSigner - ' + name, function() {
    this.timeout(30000);
    var GroupSigner;
    before(function() {
      const getGroupSigner = require(moduleName);
      return getGroupSigner().then((s) => {
        GroupSigner = s;
      });
    });
    it('seed', () => {
      expect(() => {
        const signer = new GroupSigner();
        signer.seed();
      }).to.throw();

      expect(() => {
        const signer = new GroupSigner();
        signer.seed('hello');
      }).to.throw();

      expect(() => {
        const signer = new GroupSigner();
        signer.seed(new Uint8Array(127));
      }).to.throw();

      expect(() => {
        const signer = new GroupSigner();
        signer.seed(seed1);
      }).to.not.throw();
    });

    it('setupGroup', () => {
      expect(() => {
        const signer = new GroupSigner();
        signer.setupGroup();
      }).to.throw();

      const signer = new GroupSigner();
      signer.seed(seed1);
      signer.setupGroup();

      signer.seed(seed1);
      signer.setupGroup();

      signer.seed(seed2);
      signer.setupGroup();
    });

    it('setupGroup - regression', () => {
      expect(() => {
        const signer = new GroupSigner();
        signer.setupGroup();
      }).to.throw();

      const signer = new GroupSigner();
      signer.seed(seed1);
      signer.setupGroup();

      expect(Buffer.from(signer.getGroupPubKey()).toString('base64')).to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdHiGXaKnxXk4G6PWvNpNOCvgZ7ClXmz/8eAWYLxxkQoMAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjxACAmGqKRQYlB+L9wtH/gnTiof24C1B+fWSnOV52aEU');
      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64')).to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdHiGXaKnxXk4G6PWvNpNOCvgZ7ClXmz/8eAWYLxxkQoMAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjxACAmGqKRQYlB+L9wtH/gnTiof24C1B+fWSnOV52aEUCw436RNE0txZyWtUjZn5Db0aUGZNMWCyNmpt5v/2HxMaMxA4UUPXXIpoZPZ6rgvgJ8SzaXk9gp/ZXqHvXKgAMg==');

      signer.seed(seed1);
      signer.setupGroup();
      expect(Buffer.from(signer.getGroupPubKey()).toString('base64')).to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdHiGXaKnxXk4G6PWvNpNOCvgZ7ClXmz/8eAWYLxxkQoMAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjxACAmGqKRQYlB+L9wtH/gnTiof24C1B+fWSnOV52aEU');
      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64')).to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdHiGXaKnxXk4G6PWvNpNOCvgZ7ClXmz/8eAWYLxxkQoMAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjxACAmGqKRQYlB+L9wtH/gnTiof24C1B+fWSnOV52aEUCw436RNE0txZyWtUjZn5Db0aUGZNMWCyNmpt5v/2HxMaMxA4UUPXXIpoZPZ6rgvgJ8SzaXk9gp/ZXqHvXKgAMg==');

      signer.seed(seed2);
      signer.setupGroup();
      expect(Buffer.from(signer.getGroupPubKey()).toString('base64')).to.equal('A6Rnm7aewxlszEDU2rfd6dM+w1GppZXfYSF3llh/YNwDBoniR8rxIgWvqeBtEo/GLn2x6VZNPCo2DoVonXLD+wk12dSj9vOPBXocHw24ji8mcm1DrGzQk7miCA6ncw1ZCch1x656rcGoK1kNxh1CiVfh7hLqzwHoYAnl9zVzuWoEOsh2Gv2XQn8io8kH0XCEnEl//87YDe9AM0hpUQBY2BkDnwdYS9p3fJLJmPIsr1cX2xFLYOuGysRvPzw67HRtBvUmNvszK8KzhZwQjEIA+vIhalehDAdPtvIrajQ0rcMURF0+hhoMNozPkmj3eTc19HCoMDP/Xf7mCHRaiU40uAsMVXAquRr8rwJRnTeyO8bOjIuu8JYRFhuLlBovKGYWIiTZEveUfONnWsmnX2OXVzK8HacKo6A5lub1ANXS3UYLMa5VZgiCeS/dEKkOAPhHjHgAGmpqi8XmaWcYHN1FHwEWk0VWL6AukuXszCxH1p0kVcJGbZlwr2EpU5Gx25ad');
      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64')).to.equal('A6Rnm7aewxlszEDU2rfd6dM+w1GppZXfYSF3llh/YNwDBoniR8rxIgWvqeBtEo/GLn2x6VZNPCo2DoVonXLD+wk12dSj9vOPBXocHw24ji8mcm1DrGzQk7miCA6ncw1ZCch1x656rcGoK1kNxh1CiVfh7hLqzwHoYAnl9zVzuWoEOsh2Gv2XQn8io8kH0XCEnEl//87YDe9AM0hpUQBY2BkDnwdYS9p3fJLJmPIsr1cX2xFLYOuGysRvPzw67HRtBvUmNvszK8KzhZwQjEIA+vIhalehDAdPtvIrajQ0rcMURF0+hhoMNozPkmj3eTc19HCoMDP/Xf7mCHRaiU40uAsMVXAquRr8rwJRnTeyO8bOjIuu8JYRFhuLlBovKGYWIiTZEveUfONnWsmnX2OXVzK8HacKo6A5lub1ANXS3UYLMa5VZgiCeS/dEKkOAPhHjHgAGmpqi8XmaWcYHN1FHwEWk0VWL6AukuXszCxH1p0kVcJGbZlwr2EpU5Gx25adIekebbnK9CvXhJMfwFXbW41KShxBw+WLbfrF8P9uMJQEmtJ0HaNT4LxY7NL8yL/pOnZh4uKLkL+puRcffZSSjg==');
    });

    it('joinStatic', () => {
      const server = new GroupSigner();
      server.seed(seed1);
      server.setupGroup();

      const client1 = new GroupSigner();
      client1.seed(seed1);

      const challenge = new Uint8Array(32);

      const { gsk, joinmsg } = client1.startJoin(challenge);

      const joinresp = server.processJoin(joinmsg, challenge);
      const credentials = client1.finishJoin(server.getGroupPubKey(), gsk, joinresp);

      expect(() => {
        const signer = new GroupSigner();
        signer.seed(seed1);
        signer.setGroupPubKey(server.getGroupPubKey());
        signer.sign(new Uint8Array(32), new Uint8Array(32));
      }).to.throw();

      const signer = new GroupSigner();
      signer.seed(seed1);
      signer.setGroupPubKey(server.getGroupPubKey());
      signer.setUserCredentials(credentials);
      const msg = new Uint8Array(crypto.randomBytes(32));
      const bsn = new Uint8Array(crypto.randomBytes(32));
      const bsn2 = new Uint8Array(crypto.randomBytes(32));

      const sig = signer.sign(msg, bsn);
      const sig2 = signer.sign(new Uint8Array(crypto.randomBytes(32)), bsn);
      const sig3 = signer.sign(msg, bsn2);
      expect(signer.verify(msg, bsn, sig)).to.be.true;
      expect(signer.verify(msg, bsn2, sig3)).to.be.true;
      expect(signer.verify(msg, bsn, sig2)).to.be.false;
      expect(sig).to.not.deep.equal(sig3);
      expect(sig).to.not.deep.equal(sig2);
      msg[0] = 1;
      expect(signer.verify(msg, bsn, sig)).to.be.false;

      // Tags (pseudonyms) should be same for sig and sig2, but should be diff. for sig3
      expect(signer.getSignatureTag(sig)).to.deep.equal(signer.getSignatureTag(sig2));
      expect(signer.getSignatureTag(sig)).to.not.deep.equal(signer.getSignatureTag(sig3));
    });

    it('joinStatic - regression', () => {
      const server = new GroupSigner();
      server.seed(seed1);
      server.setupGroup();

      const client1 = new GroupSigner();
      client1.seed(seed1);

      const challenge = new Uint8Array(32);

      const { gsk, joinmsg } = client1.startJoin(challenge);
      expect(Buffer.from(joinmsg).toString('base64')).to.equal('BAU/ZW2W8Bq23HTgf5zrlvSKXUakhjFdowxsCGVrqknmDW/6vfQm8FnGNPxmw6EYJvcteGGl3q4M3ERrYOKUwXwgLYZ2U1usQzmVrey89K/TkMDdsIkxkoeg2r/K2WuIEAwcGILQ1nyhsBVnR3fRcI13FSIjXTtm2mgkYH+cEsdS');

      const joinresp = server.processJoin(joinmsg, challenge);
      const credentials = client1.finishJoin(server.getGroupPubKey(), gsk, joinresp);
      expect(Buffer.from(credentials).toString('base64')).to.equal('BATO7yOo0yMCtAHOVp2kc2/PFVMR9grIMnwjRngQy8/wD+bIoWWrgZs2i855ZFi1ObZoYPY6/4pg2co9ZtsgNvsEEascEj2Cbjfy3cbF1YA0qRQVYKz2M9FhOCc6Uk96+xsccJrI7SvskH62m90ddnQEhfWH7mFufXhKZ94nqYw77wQattrejw9pltMu18GquD/QAI6ftSa75kQNvpfb9Rp+axAMgN/IvyloidMxXmRfI9rPSAWKfqmlPOoX52tjlNrEBBPvi5aGLgRcQ74IMpd/leB27CIhAyBQAYK+95/TxK+lA5/LR02enh0CcRuH7l8zB2Uf6sX5F/4/jslHwJGCjeYLDjfpE0TS3FnJa1SNmfkNvRpQZk0xYLI2am3m//YfEw==');
    });

    // Not a real test, but primarily for documenting a nasty bug that we have to dodge.
    // In production, we have no code path that is affected (the servers have been
    // upgraded to use Node 14 some time ago).
    //
    // I see no proper way to fix it. Maybe it gets fixed in newer versions of Node?
    // For now, being aware of the situation is the best that I can see.
    it('should work with native compiled code in Node 14', () => {
      const issuer = new GroupSigner();
      issuer.seed(new Uint8Array(128)); // <-- Note: creates an Uint8Array of size 128!
      issuer.setupGroup();
      let signer = new GroupSigner();

      // Now passing "new Uint8Array()" or "new Uint8Array(0)" triggers a weird edge after
      // updating from Node 12 to Node 14. I would consider it a bug, but not on our side.
      // I think it is the same problem as described in this thread one
      // (https://github.com/nodejs/node/issues/31061#issuecomment-568355014)
      //
      // > It's due to a behaviour change in V8 ArrayBuffer. Previously, when a static buffer
      // > (or one that outlives the ArrayBuffer) is used, the BackingStore will not be registered.
      // > Now that it is registered, problem might occur when new ArrayBuffer is allocated at the
      // >same place of previous ArrayBuffer that is still being tracked in BackingStore table.
      //
      // For background, this is the change in V8 (related to ArrayBuffer without BackingStore):
      // https://github.com/nodejs/node/pull/30782
      //
      // Note that the problem does not occur in production (server or WebExtension).
      // The buffers have proper size, thus the code path to detect too small arrays
      // is not required. In addition, the WebExtension does not run native code, but
      // either wasm or asmjs, which both are not affected.

      // For completeness, we can run all checks on non-native builds:
      if (['wasm', 'asmjs', 'web'].includes(name)) {
        expect(() => signer.seed(new Uint8Array())).to.throw('seed too small');
        expect(() => signer.seed(new Uint8Array(0))).to.throw('seed too small');
        expect(() => signer.seed(new Uint8Array(1))).to.throw('seed too small');
      } else {
        // Here we are in native code. This test will now fail:
        // expect(() => signer.seed(new Uint8Array(0))).to.throw('seed too small');
        //
        // The reason is that "GS_seed" in group-sign.c will think it got a
        // buffer of size 128. Or of size 129 if you change the previous code to
        //
        //    issuer.seed(new Uint8Array(129));
        //
        // To retain some test coverage, this one will always pass. It will force
        // a new buffer to be created, so it will not reuse the last one.
        expect(() => signer.seed(new Uint8Array(1))).to.throw('seed too small');
      }
    });

    it('errors', () => {
      const issuer = new GroupSigner();
      issuer.seed(new Uint8Array(128));
      issuer.setupGroup();

      // seed
      let signer = new GroupSigner();
      expect(() => signer.seed()).to.throw('expected 1 arguments');
      expect(() => signer.seed(1, 2)).to.throw('expected 1 arguments');
      expect(() => signer.seed('hello')).to.throw('input data must be uint8array');
      expect(() => signer.seed(new Uint16Array([1, 2, 3]))).to.throw('input data must be uint8array');
      const buffer1 = (new Uint8Array()).buffer;
      const buffer2 = (new Uint32Array(128)).buffer;
      expect(() => signer.seed(buffer1)).to.throw('input data must be uint8array');
      expect(() => signer.seed(buffer2)).to.throw('input data must be uint8array');

      // Note: to understand why the following assertion will break on native code
      // with Node 14, see the previous test (on "native compiled code in Node 14").
      if (['wasm', 'asmjs', 'web'].includes(name)) {
        expect(() => signer.seed(new Uint8Array())).to.throw('seed too small');
      }
      expect(() => signer.seed(new Uint8Array(1))).to.throw('seed too small');
      expect(() => signer.seed(new Uint8Array(127))).to.throw('seed too small');

      // setupGroup
      signer = new GroupSigner();
      expect(() => signer.setupGroup()).to.throw('not seeded');
      expect(() => signer.setupGroup(1)).to.throw('expected 0 arguments');

      // getGroupPubKey
      signer = new GroupSigner();
      expect(() => signer.getGroupPubKey(1)).to.throw('expected 0 arguments');
      expect(() => signer.getGroupPubKey()).to.throw('group public key not set');

      // getGroupPrivKey
      signer = new GroupSigner();
      expect(() => signer.getGroupPrivKey(1)).to.throw('expected 0 arguments');
      expect(() => signer.getGroupPrivKey()).to.throw('group private key not set');
      signer.setGroupPubKey(issuer.getGroupPubKey());
      expect(() => signer.getGroupPrivKey()).to.throw('group private key not set');

      // setGroupPubKey
      signer = new GroupSigner();
      expect(() => signer.setGroupPubKey()).to.throw('expected 1 arguments');
      expect(() => signer.setGroupPubKey(1, 1)).to.throw('expected 1 arguments');
      expect(() => signer.setGroupPubKey('asdf')).to.throw('input data must be uint8array');
      expect(() => signer.setGroupPubKey(new Uint8Array(1024))).to.throw('invalid group public key');

      // setGroupPrivKey
      signer = new GroupSigner();
      expect(() => signer.setGroupPrivKey()).to.throw('expected 1 arguments');
      expect(() => signer.setGroupPrivKey(1, 1)).to.throw('expected 1 arguments');
      expect(() => signer.setGroupPrivKey('asdf')).to.throw('input data must be uint8array');
      expect(() => signer.setGroupPrivKey(new Uint8Array(1024))).to.throw('invalid group private key');

      // processJoin
      signer = new GroupSigner();
      expect(() => signer.processJoin()).to.throw('expected 2 arguments');
      expect(() => signer.processJoin(new Uint8Array(1024))).to.throw('expected 2 arguments');
      expect(() => signer.processJoin(1, 1, 1)).to.throw('expected 2 arguments');
      expect(() => signer.processJoin(1, 1)).to.throw('input data must be uint8array');
      expect(() => signer.processJoin(new Uint8Array(1024), new Uint8Array(1024))).to.throw('not seeded');
      signer.seed(new Uint8Array(128));
      expect(() => signer.processJoin(new Uint8Array(1024), new Uint8Array(1024))).to.throw('group private key not set');
      signer.setupGroup();
      expect(() => signer.processJoin(new Uint8Array(1024), new Uint8Array(1024))).to.throw('invalid join message');

      // sign
      signer = new GroupSigner();
      expect(() => signer.sign()).to.throw('expected 2 arguments');
      expect(() => signer.sign(1)).to.throw('expected 2 arguments');
      expect(() => signer.sign(1, 2, 3)).to.throw('expected 2 arguments');
      expect(() => signer.sign(new Uint8Array(1024), 2)).to.throw('input data must be uint8array');
      expect(() => signer.sign(new Uint8Array(1024), new Uint8Array(1024))).to.throw('not seeded');
      signer.seed(new Uint8Array(128));
      expect(() => signer.sign(new Uint8Array(1024), new Uint8Array(1024))).to.throw('user credentials not set');

      // verify
      const verifier = new GroupSigner();
      expect(() => verifier.verify()).to.throw('expected 3 arguments');
      expect(() => verifier.verify(1)).to.throw('expected 3 arguments');
      expect(() => verifier.verify(1, 2)).to.throw('expected 3 arguments');
      expect(() => verifier.verify(1, 2, 3, 4)).to.throw('expected 3 arguments');
      expect(() => verifier.verify(new Uint8Array(1024), new Uint8Array(1024), 3)).to.throw('input data must be uint8array');
      expect(() => verifier.verify(new Uint8Array(1024), new Uint8Array(1024), new Uint8Array(1024))).to.throw('group public key not set');
      verifier.setGroupPubKey(issuer.getGroupPubKey());
      expect(() => verifier.verify(new Uint8Array(1024), new Uint8Array(1024), new Uint8Array(1024))).to.throw('invalid signature');

      // getSignatureTag
      signer = new GroupSigner();
      expect(() => signer.getSignatureTag()).to.throw('expected 1 arguments');
      expect(() => signer.getSignatureTag(1, 2)).to.throw('expected 1 arguments');
      expect(() => signer.getSignatureTag(1)).to.throw('input data must be uint8array');
      expect(() => signer.getSignatureTag(new Uint8Array(1024))).to.throw('invalid signature');

      // getUserCredentials
      signer = new GroupSigner();
      expect(() => signer.getUserCredentials(1)).to.throw('expected 0 arguments');
      expect(() => signer.getUserCredentials()).to.throw('user credentials not set');

      // setUserCredentials
      signer = new GroupSigner();
      expect(() => signer.setUserCredentials()).to.throw('expected 1 arguments');
      expect(() => signer.setUserCredentials(1, 2)).to.throw('expected 1 arguments');
      expect(() => signer.setUserCredentials(1)).to.throw('input data must be uint8array');
      expect(() => signer.setUserCredentials(new Uint8Array(1024))).to.throw('invalid user credentials');

      // startJoin
      signer = new GroupSigner();
      expect(() => signer.startJoin()).to.throw('expected 1 arguments');
      expect(() => signer.startJoin(1, 2)).to.throw('expected 1 arguments');
      expect(() => signer.startJoin(1)).to.throw('input data must be uint8array');
      expect(() => signer.startJoin(new Uint8Array(1))).to.throw('not seeded');

      // finishJoin
      signer = new GroupSigner();
      expect(() => signer.finishJoin()).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1, 2)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1, 2, 3, 4)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(new Uint8Array(1), new Uint8Array(1), 3)).to.throw('input data must be uint8array');
      expect(() => signer.finishJoin(new Uint8Array(1), new Uint8Array(1), new Uint8Array(1))).to.throw('invalid group public key');

      expect(() => signer.finishJoin(verifier.getGroupPubKey(), new Uint8Array(1), new Uint8Array(1))).to.throw('invalid user private key');

      signer.seed(new Uint8Array(128));
      expect(() => signer.finishJoin(verifier.getGroupPubKey(), signer.startJoin(new Uint8Array(1)).gsk, new Uint8Array(1024))).to.throw('invalid join response');
    });

    /**
     * Regression test for the final step: verification of the message
     *
     * This test simulates receiving data from an old client, for group keys
     * generated with an older version of the library. As long as we do not
     * violate backward compatibility, a verifier running the latest code
     * should still accept the message.
     */
    it('should accept signatures from old clients (regression)', () => {
      const signer = new GroupSigner();

      // The actual keys do not matter much. Here we are using the identical keys
      // as public and private one. Of course, in a real-world setup, you would
      // use different ones, but for the sake of the test, it will not matter.
      const makeKey = () => new Uint8Array([35, 203, 57, 207, 35, 19, 225, 65, 230, 169, 30, 26, 247, 218, 129, 157, 149, 151, 113, 11, 124, 151, 139, 30, 63, 59, 98, 72, 75, 157, 73, 229, 25, 169, 249, 212, 101, 165, 175, 87, 195, 38, 120, 143, 214, 163, 68, 48, 42, 145, 77, 163, 22, 26, 111, 23, 232, 169, 122, 246, 232, 168, 3, 47, 36, 93, 37, 206, 127, 164, 33, 248, 163, 171, 251, 215, 136, 132, 249, 10, 141, 89, 0, 200, 182, 177, 159, 127, 217, 118, 81, 196, 152, 35, 68, 33, 14, 232, 37, 220, 245, 139, 10, 204, 50, 169, 228, 35, 45, 134, 100, 8, 137, 63, 66, 142, 34, 19, 151, 142, 153, 111, 92, 51, 148, 236, 197, 15, 3, 98, 77, 148, 73, 107, 140, 183, 63, 161, 239, 108, 102, 126, 137, 144, 163, 111, 5, 201, 189, 70, 181, 212, 20, 224, 181, 177, 125, 115, 11, 81, 29, 237, 181, 115, 232, 39, 242, 24, 79, 23, 153, 53, 241, 110, 13, 97, 148, 107, 115, 22, 118, 80, 9, 46, 7, 86, 54, 197, 154, 15, 35, 226, 6, 12, 231, 182, 92, 98, 195, 154, 185, 197, 208, 147, 38, 73, 141, 112, 220, 219, 102, 85, 81, 29, 233, 224, 249, 149, 248, 214, 12, 88, 226, 199, 8, 63, 79, 169, 49, 91, 79, 64, 88, 248, 52, 80, 5, 3, 21, 99, 50, 94, 25, 150, 187, 243, 187, 46, 190, 34, 235, 119, 45, 130, 193, 196, 20, 6, 213, 56, 152, 217, 208, 13, 185, 114, 101, 189, 150, 206, 11, 200, 212, 178, 7, 153, 188, 166, 103, 192, 33, 191, 150, 57, 218, 101, 13, 2, 27, 33, 116, 255, 39, 77, 105, 208, 172, 72, 179, 197, 125, 56, 158, 113, 34, 100, 92, 189, 79, 139, 147, 75, 199, 54, 156, 27, 254, 16, 4, 242, 33, 203, 133, 99, 83, 129, 160, 215, 177, 205, 205, 182, 46, 42, 88, 194, 189, 45, 35, 1, 182, 44, 184, 49, 7, 170, 46, 217, 224, 197, 211, 165, 17, 26, 125, 93, 214, 76, 79, 114, 25, 208, 118, 204, 79, 209, 49, 25, 37, 80, 219, 164, 112, 0, 181, 107, 32, 35, 111, 139, 72, 195, 172, 131, 3, 231, 182, 134, 7, 146, 107, 9, 25, 12, 147, 228, 112, 178, 178, 91, 187, 9, 203, 35, 208, 216, 238, 120, 162, 168, 77, 152, 1, 83, 37, 32, 25, 183, 157, 96, 182, 192, 217, 192, 159, 170, 37, 54, 208, 241, 243, 84, 55, 188, 225, 67, 209, 218, 44, 156, 36, 39, 238, 246, 27, 191, 162, 138]);

      // Note: any seed will work here
      signer.seed(new Uint8Array(128));

      const pubKey = makeKey();
      const privKey = makeKey();
      signer.setGroupPubKey(pubKey);
      signer.setGroupPrivKey(privKey);

      // this signature has been generated by an older client
      // (message: {"action":"query","payload":{"q":"hello906","channel":"test"},"ts":"20191106"})
      const hashPayloadBuffer = new Uint8Array([33, 161, 173, 129, 103, 248, 253, 77, 118, 112, 225, 12, 163, 155, 23, 5, 88, 247, 234, 178, 112, 105, 6, 179, 32, 174, 162, 107, 215, 196, 235, 216]);
      const bsnBuffer = new Uint8Array([82, 119, 164, 208, 137, 224, 9, 147, 244, 18, 123, 200, 98, 47, 185, 10, 9, 194, 28, 94, 211, 201, 75, 6, 208, 21, 141, 250, 65, 142, 253, 209]);
      const sigBuffer = Buffer.from([4, 33, 33, 218, 186, 109, 104, 166, 108, 222, 208, 132, 226, 82, 104, 134, 1, 217, 70, 190, 43, 155, 168, 60, 48, 102, 203, 240, 47, 36, 222, 45, 141, 9, 187, 8, 166, 47, 15, 117, 97, 34, 158, 206, 71, 105, 173, 167, 223, 17, 172, 153, 23, 60, 107, 222, 96, 209, 156, 42, 70, 61, 232, 20, 141, 4, 33, 167, 192, 82, 193, 123, 100, 32, 133, 172, 40, 125, 81, 158, 236, 98, 39, 242, 144, 161, 131, 55, 64, 160, 102, 162, 121, 21, 43, 145, 112, 118, 34, 4, 247, 69, 66, 64, 142, 66, 62, 29, 132, 194, 152, 34, 142, 193, 224, 139, 219, 227, 1, 71, 75, 214, 137, 208, 200, 4, 58, 85, 156, 228, 4, 5, 6, 119, 36, 109, 91, 124, 145, 131, 161, 208, 226, 82, 85, 88, 154, 213, 250, 35, 191, 73, 162, 43, 141, 40, 92, 212, 250, 247, 128, 229, 47, 7, 139, 58, 79, 185, 135, 254, 74, 36, 155, 206, 13, 16, 214, 11, 201, 206, 250, 106, 37, 237, 15, 18, 182, 227, 99, 64, 133, 163, 63, 186, 145, 4, 20, 182, 116, 218, 17, 235, 232, 150, 216, 46, 71, 158, 10, 243, 191, 239, 211, 155, 158, 192, 69, 144, 242, 146, 3, 4, 142, 125, 45, 197, 188, 195, 12, 80, 89, 97, 227, 42, 177, 252, 243, 52, 31, 236, 208, 227, 103, 208, 165, 238, 179, 126, 253, 175, 209, 47, 247, 163, 234, 249, 142, 103, 72, 51, 4, 10, 181, 212, 211, 77, 17, 71, 208, 123, 80, 227, 80, 151, 53, 10, 228, 161, 53, 239, 148, 164, 221, 184, 124, 154, 195, 199, 109, 193, 121, 57, 42, 7, 23, 194, 17, 64, 218, 125, 61, 38, 178, 59, 31, 132, 127, 197, 245, 198, 210, 117, 103, 160, 68, 239, 230, 12, 181, 80, 239, 110, 75, 113, 119, 15, 239, 128, 192, 117, 172, 206, 203, 217, 165, 36, 192, 44, 220, 181, 44, 17, 41, 247, 69, 225, 67, 72, 182, 209, 52, 121, 199, 102, 86, 188, 55, 21, 92, 125, 161, 171, 252, 22, 124, 127, 2, 101, 214, 55, 17, 177, 23, 126, 6, 156, 195, 145, 4, 44, 17, 119, 239, 251, 47, 93, 126, 67, 214]);

      expect(signer.verify(hashPayloadBuffer, bsnBuffer, sigBuffer)).to.equal(true, 'must successfully validate');
    });
  });
}


Object.keys(testModules).forEach((name) => {
  doTests(name, testModules[name]);
});
