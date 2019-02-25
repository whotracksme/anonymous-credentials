# anonymous-credentials

Anonymous credentials for server (NodeJS) and browser (WebAssembly, asm.js). Allows an issuer (typically a server) to issue (private) credentials to a user so that the
user can sign messages proving possession of such credentials, but in a way that signatures performed with the same credentials cannot be linked together. Optionally, signatures
can have a ***basename***, which makes two signatures done with the same credentials linkable ***if and only if*** the basenames used in each are the same.

The concrete implemented operations are the ones described in https://eprint.iacr.org/2015/1246
(based on Camenisch-Lysyanskaya signatures), but without a Trusted Platform Module in the ***join*** operation (therefore, only software).

For the underlying elliptic curve bilinear pairing primitives, we use [Apache Milagro Crypto Library](https://github.com/miracl/amcl).
Even if the core implementation is in C, we target server (NodeJS native module) and client (WebAssembly, asm.js): currently only to be used in
 a JavaScript environment. Therefore, only the JavaScript API is documented.

## Usage

There are three build targets: NodeJS native module, WebAssembly and asm.js. The node native module is faster than the
 WebAssembly version, but it is not built by default. See [Building](#building) for instructions on this.

```js
const getCredentialManager = require('anonymous-credentials'); // Returns the first working version of [native, web]

// Requiring concrete versions
const getCredentialManager = require('anonymous-credentials/lib/native'); // NodeJS native module
const getCredentialManager = require('anonymous-credentials/lib/wasm'); // WebAssembly version
const getCredentialManager = require('anonymous-credentials/lib/asmjs'); // asm.js (slower fallback if WebAssembly is not supported)
const getCredentialManager = require('anonymous-credentials/lib/web'); // Chooses between wasm or asm.js, depending on the environment support
```

Once required, we can create instances of CredentialManager class:

```js
async function myfunc() {
  ...
  // CredentialManager class must be obtained asynchronously.
  const CredentialManager = await getCredentialManager();

  // Same class can be used for three different roles
  const signer = new CredentialManager();
  const issuer = new CredentialManager();
  const verifier = new CredentialManager();
  ...
}
```

See [API](#api) for an explanation of the instance operations.

## API

All parameters are ***Uint8Array***. If not specified, assume ***undefined*** is returned. If a return value is specified, assume it is ***Uint8Array*** unless explicitly stated.

### Common for Signers, Verifiers and Issuers
- ***seed(entropy)*** : Must be called before any other operation. It expects at least 128 bytes of entropy. ```crypto.getRandomValues``` (browser) or ```crypto.randomBytes``` (NodeJS) can be used.

### Issuers
- ***setupGroup()*** : Generates new (random) group keys and sets them internally. Does not return anything, but once executed private and public group keys can be retrieved via ***getGroupPrivKey*** and ***getGroupPubKey***.
- ***getGroupPubKey()*** : Returns the internal group public key.
- ***getGroupPrivKey()*** : Returns the internal group private key.
- ***setGroupPrivKey(groupPrivKey)*** : Sets a group private key previously retrieved via ***getGroupPrivKey***. It also sets the group public key.
- ***processJoin(joinMessage, challenge)*** : Expects a joinMessage returned by ***startJoin***, and the same challenge that the user used to call the method. Returns a joinResponse that must be sent to the user in order to finish the join protocol, receive credentials and be able to sign messages.

### Signers
- ***startJoin(challenge)*** : Given a challenge (or nonce, agreed with the issuer) it returns an object containing two keys:
    - ***gsk*** : User private key (Uint8Array), to be kept secret until a join response is received by the issuer.
    - ***joinmsg*** : Join message (Uint8Array) to be sent to the issuer together with the used challenge, so that we can receive a corresponding response and finish the join protocol. Notice that a received ***joinResponse*** will only be valid for the ***gsk*** that was returned together with the sent ***joinmsg***.
- ***finishJoin(groupPubKey, gsk, joinResponse)*** : Given a group public key (must be obtained from the issuer or verifier), a gsk returned by ***startJoin*** and a joinResponse received from an issuer via ***processJoin*** returns valid credentials that can be set using ***setUserCredentials***.
- ***setUserCredentials(credentials)*** : Needs to be called before being able to ***sign***. It internally sets credentials returned by a successful ***finishJoin***.
- ***sign(message, basename)*** : Returns a signature on the received message and basename, with the property that two signatures performed with the same user credentials can be linked ***if and only if*** their basenames are equal. Otherwise, the only information that can be obtained is whether it is a valid signature from a member of the group (someone holding valid credentials obtained by the issuer).

### Verifiers
- ***setGroupPubKey(groupPubKey)*** : Sets a group public key internally (obtained from an issuer).
- ***verify(message, basename, signature)*** : Returns a boolean indicating whether a signature is valid for the given ```message```, ```basename``` and (internal) group public key (set via ***setGroupPubKey***).
- ***getSignatureTag(signature)*** : Returns tag that maps to the signature ```basename```, that is, two tags from different signature will be equal ***if and only if*** they correspond to two signatures done with the same user credentials and basename.

## Building

The C code of the library that is used for all three build targets can be found in `core`.
This is used in `groupsign_napi.c` to create a NodeJS module via [N-API](https://nodejs.org/api/n-api.html).
The Emscripten bindings to build WebAssembly and asm.js versions are in `pre.js`.

To build, first checkout dependencies:

    git submodule update --init --recursive

NodeJS native module (clang and cmake required):

    npm run native-install

WebAssembly and asm.js versions (docker without sudo required):

    make build-javascript-lib

To build everything:

    make

## Running the tests

    make test

## Changing the curve

We currently use `BN254` pairing-friendly curve, which according to our knowledge has roughly 100-bit security.

To move to a new curve, the following steps are required:

1. Change [CURVE](CURVE) to a pairing-friendly curve supported by AMCL library.
2. Change [build-common.sh](build-common.sh) so that the `config64.py` choice includes the selected curve.
3. Run `npm run native-install` and ignore the errors.
4. Run `grep CURVE_Order_ _build/nativebuild/ecp_NEWCURVE.h` and write down the result -> `BIG_XXX`.
5. Add the required defines and typedefs in [core/curve-specific.h](core/curve-specific.h). It should suffice to copy `BN254` case, change `BN254` -> `NEWCURVE` and change `256_56` -> to the `XXX` in the previous step.
6. Run `make && npm test`. All tests should pass except regression ones (currently hardcoded to `BN254`).
