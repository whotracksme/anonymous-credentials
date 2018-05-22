let initPromise;

module.exports = (makeModule) => {
  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      try {
        makeModule().then(({ GroupSigner }) => resolve(GroupSigner));
      } catch (e) {
        reject(e);
      }
    });
  }
  return initPromise;
};
