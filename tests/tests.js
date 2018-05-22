const expect = require('chai').expect;

const testModules = {
  native: '../lib/index',
  wasm: '../lib/wasm',
  asmjs: '../lib/asmjs',
};

async function doTests(name, getGroupSigner) {
  const seed1 = new Uint8Array(128);
  const seed2 = new Uint8Array(128);

  for (let i = 0; i < 128; i += 1) {
    seed1[i] = i;
    seed2[i] = i + 1;
  }
  describe('GroupSigner - ' + name, () => {
    var GroupSigner;
    before(function() {
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

//      expect(Buffer.from(signer.getGroupPubKey()).toString('base64'))
//        .to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdFduOrzj+H9rx/Hctlo9niAgPxKV5hh5hcHWPZYtjXTEAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjwc47riAlX0KNgE2gjdAz6KnQSdg7JnsUkYUuiOIfzZy');

//      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64'))
//        .to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdFduOrzj+H9rx/Hctlo9niAgPxKV5hh5hcHWPZYtjXTEAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjwc47riAlX0KNgE2gjdAz6KnQSdg7JnsUkYUuiOIfzZyCw436RNE0txZyWtUjZn5Db0aUGZNMWCyNmpt5v/2HxMaMxA4UUPXXIpoZPZ6rgvgJ8SzaXk9gp/ZXqHvXKgAMg==');

      signer.seed(seed1);
      signer.setupGroup();
//      expect(Buffer.from(signer.getGroupPubKey()).toString('base64'))
//        .to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdFduOrzj+H9rx/Hctlo9niAgPxKV5hh5hcHWPZYtjXTEAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjwc47riAlX0KNgE2gjdAz6KnQSdg7JnsUkYUuiOIfzZy');

//      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64'))
//        .to.equal('BUY57Gl3XT/q8dxehyJGzYzqNOhbuHxQVMpOz1ziedEKaKxqTrtPuPb6ql8n5Kb+uZ9uCWmBOha2q++SLW+kpSS+nfBTvnD0o1s2XR2hNyfcVfmGwofjuyKUnkO18LcoEHCb/4SEWHTg/Sb5N55KVzzxx6uGlM8pFOc3a/KkSbAPmjuG2Lq2QXgfD7/Re8CrscsZAKDuj6GfnFQFTAnQXgrZmMIfQBciIwIt8LKqJxFwpT1KYu3QNClKEzvi2aA6IxPC7hbQKMWF0Oj06pIP51ubwFChj++MX7ofGgyLIccMVf5aNjDZomCd+hexbKPMkq0fhKgEDdbKTYIZ5Z/TSiIcamiSzp7/IcHG+m0UhV1tba0YwoU67r6MJvDUCVcdFduOrzj+H9rx/Hctlo9niAgPxKV5hh5hcHWPZYtjXTEAtdJXNRyM+f7W1bXkkR5H5AHQfXY/FDNK5Rl+XQpxjwc47riAlX0KNgE2gjdAz6KnQSdg7JnsUkYUuiOIfzZyCw436RNE0txZyWtUjZn5Db0aUGZNMWCyNmpt5v/2HxMaMxA4UUPXXIpoZPZ6rgvgJ8SzaXk9gp/ZXqHvXKgAMg==');

      signer.seed(seed2);
      signer.setupGroup();
//      expect(Buffer.from(signer.getGroupPubKey()).toString('base64'))
//        .to.equal('A6Rnm7aewxlszEDU2rfd6dM+w1GppZXfYSF3llh/YNwDBoniR8rxIgWvqeBtEo/GLn2x6VZNPCo2DoVonXLD+wk12dSj9vOPBXocHw24ji8mcm1DrGzQk7miCA6ncw1ZCch1x656rcGoK1kNxh1CiVfh7hLqzwHoYAnl9zVzuWoEOsh2Gv2XQn8io8kH0XCEnEl//87YDe9AM0hpUQBY2BkDnwdYS9p3fJLJmPIsr1cX2xFLYOuGysRvPzw67HRtBvUmNvszK8KzhZwQjEIA+vIhalehDAdPtvIrajQ0rcMURF0+hhoMNozPkmj3eTc19HCoMDP/Xf7mCHRaiU40uAsMVXAquRr8rwJRnTeyO8bOjIuu8JYRFhuLlBovKGYWG8IfTm7jddv4mdEp/kfenUTjaTpI01YWOoAX6EyXmZkLMa5VZgiCeS/dEKkOAPhHjHgAGmpqi8XmaWcYHN1FHwq8Rg89to5W7dqwNrXZXcn/9HJKc3Xc1ADWjdlGTIuE');

//      expect(Buffer.from(signer.getGroupPrivKey()).toString('base64'))
//        .to.equal('A6Rnm7aewxlszEDU2rfd6dM+w1GppZXfYSF3llh/YNwDBoniR8rxIgWvqeBtEo/GLn2x6VZNPCo2DoVonXLD+wk12dSj9vOPBXocHw24ji8mcm1DrGzQk7miCA6ncw1ZCch1x656rcGoK1kNxh1CiVfh7hLqzwHoYAnl9zVzuWoEOsh2Gv2XQn8io8kH0XCEnEl//87YDe9AM0hpUQBY2BkDnwdYS9p3fJLJmPIsr1cX2xFLYOuGysRvPzw67HRtBvUmNvszK8KzhZwQjEIA+vIhalehDAdPtvIrajQ0rcMURF0+hhoMNozPkmj3eTc19HCoMDP/Xf7mCHRaiU40uAsMVXAquRr8rwJRnTeyO8bOjIuu8JYRFhuLlBovKGYWG8IfTm7jddv4mdEp/kfenUTjaTpI01YWOoAX6EyXmZkLMa5VZgiCeS/dEKkOAPhHjHgAGmpqi8XmaWcYHN1FHwq8Rg89to5W7dqwNrXZXcn/9HJKc3Xc1ADWjdlGTIuEIekebbnK9CvXhJMfwFXbW41KShxBw+WLbfrF8P9uMJQEmtJ0HaNT4LxY7NL8yL/pOnZh4uKLkL+puRcffZSSjg==');
    });

    it('joinStatic', () => {
      const server = new GroupSigner();
      server.seed(seed1);
      server.setupGroup();

      const client1 = new GroupSigner();
      client1.seed(seed1);

      const challenge = new Uint8Array(32);

      const { gsk, joinmsg } = client1.startJoinStatic(challenge);
//      expect(Buffer.from(joinmsg).toString('base64')).to.equal('BT9lbZbwGrbcdOB/nOuW9IpdRqSGMV2jDGwIZWuqSeYNb/q99CbwWcY0/GbDoRgm9y14YaXergzcRGtg4pTBfAJ9WKP+TtgjlWA5VAredZxBqXy8TG89b2bb//v7MZn3JCJvjJ6DpWpyixEKJutbIYwWoBY5FlzoGMOZ4z7qrtk=');

      const joinresp = server.processJoin(joinmsg, challenge);
      const credentials = client1.finishJoinStatic(server.getGroupPubKey(), gsk, joinresp);
//      expect(Buffer.from(credentials).toString('base64')).to.equal('BM7vI6jTIwK0Ac5WnaRzb88VUxH2CsgyfCNGeBDLz/AP5sihZauBmzaLznlkWLU5tmhg9jr/imDZyj1m2yA2+xGrHBI9gm438t3GxdWANKkUFWCs9jPRYTgnOlJPevsbHHCayO0r7JB+tpvdHXZ0BIX1h+5hbn14SmfeJ6mMO+8attrejw9pltMu18GquD/QAI6ftSa75kQNvpfb9Rp+axAMgN/IvyloidMxXmRfI9rPSAWKfqmlPOoX52tjlNrEE++LloYuBFxDvggyl3+V4HbsIiEDIFABgr73n9PEr6UDn8tHTZ6eHQJxG4fuXzMHZR/qxfkX/j+OyUfAkYKN5gsON+kTRNLcWclrVI2Z+Q29GlBmTTFgsjZqbeb/9h8T');

      expect(() => {
        const signer = new GroupSigner();
        signer.seed(seed1);
        signer.setGroupPubKey(server.getGroupPubKey());
        signer.sign(new Uint8Array(32), new Uint8Array(32));
      }).to.throw();

      const signer = new GroupSigner();
      signer.seed(seed1);
      signer.setGroupPubKey(server.getGroupPubKey());
      signer.setUserPrivKey(credentials);
      const msg = new Uint8Array(32);
      const bsn = new Uint8Array(32);

      const sig = signer.sign(msg, bsn);
      expect(signer.verify(msg, bsn, sig)).to.be.true;
      msg[0] = 1;
      expect(signer.verify(msg, bsn, sig)).to.be.false;
    });
  });
}


Object.keys(testModules).forEach((name) => {
  doTests(name, require(testModules[name]));
});
