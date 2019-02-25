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
      expect(() => signer.seed(new Uint8Array())).to.throw('seed too small');
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
      expect(() => signer.startJoin(new Uint8Array())).to.throw('not seeded');

      // finishJoin
      signer = new GroupSigner();
      expect(() => signer.finishJoin()).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1, 2)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(1, 2, 3, 4)).to.throw('expected 3 arguments');
      expect(() => signer.finishJoin(new Uint8Array(), new Uint8Array(), 3)).to.throw('input data must be uint8array');
      expect(() => signer.finishJoin(new Uint8Array(), new Uint8Array(), new Uint8Array())).to.throw('invalid group public key');
      expect(() => signer.finishJoin(verifier.getGroupPubKey(), new Uint8Array(), new Uint8Array())).to.throw('invalid user private key');
      signer.seed(new Uint8Array(128));
      expect(() => signer.finishJoin(verifier.getGroupPubKey(), signer.startJoin(new Uint8Array()).gsk, new Uint8Array(1024))).to.throw('invalid join response');
    });
  });
}


Object.keys(testModules).forEach((name) => {
  doTests(name, testModules[name]);
});
