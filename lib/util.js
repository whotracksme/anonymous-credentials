'use strict';
module.exports = {
  initModule(makeModule) {
    return new Promise((resolve, reject) => {
      try {
        makeModule().then(({ GroupSigner }) => resolve(GroupSigner));
      } catch (e) {
        reject(e);
      }
    });
  }
};
