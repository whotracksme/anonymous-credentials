#include <emscripten/emscripten.h>
#include "group-sign.h"
#include "randapi.h"

enum ReturnCodes {
  JS_RETURN_FAILURE,
  JS_RETURN_SUCCESS,
  JS_RETURN_UNINITIALIZED,
  JS_INVALID_DATA,
};

enum StateFlags {
  JS_SEEDED,
  JS_GROUP_PRIVKEY,
  JS_GROUP_PUBKEY,
  JS_STARTJOIN,
  JS_USERCREDS,
};

static csprng _rng;
static struct GroupPrivateKey _priv;
static struct UserPrivateKey _userPriv;
static int state = 0;

// Start - Operations that modify internal state
int EMSCRIPTEN_KEEPALIVE JS_seed(char* seed, int seed_length) {
  if (seed_length < 128) {
    return JS_INVALID_DATA;
  }
  RAND_seed(&_rng, seed_length, seed);
  state |= 1 << JS_SEEDED;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_setupGroup() {
  if (!((1 << JS_SEEDED)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  state &= (1 << JS_SEEDED);
  setup(&_rng, &_priv);
  state |= 1 << JS_GROUP_PRIVKEY;
  state |= 1 << JS_GROUP_PUBKEY;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_loadGroupPrivKey(char* data, int len) {
  state &= (1 << JS_SEEDED);
  octet o = {0, len, data};
  if (!deserialize_group_private_key(&o, &_priv)) {
    return JS_INVALID_DATA;
  }
  state |= 1 << JS_GROUP_PRIVKEY;
  state |= 1 << JS_GROUP_PUBKEY;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_loadGroupPubKey(char* data, int len) {
  state &= (1 << JS_SEEDED);
  octet o = {0, len, data};
  if (!deserialize_group_public_key(&o, &_priv.pub)) {
    return JS_INVALID_DATA;
  }
  state |= 1 << JS_GROUP_PUBKEY;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_startJoin(Byte32 challenge, char* joinmsg, int* len) {
  if (!((1 << JS_SEEDED)&state) || !((1 << JS_GROUP_PUBKEY)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  state |= (1 << JS_STARTJOIN);
  state &= ~(1 << JS_USERCREDS);

  struct JoinMessage j;
  join_client(&_rng, challenge, &j, &_userPriv);
  octet o = {0, *len, joinmsg};
  if (!serialize_join_message(&j, &o)) {
    return JS_INVALID_DATA;
  }
  *len = o.len;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_finishJoin(char* joinresponse, int len) {
  if (!((1 << JS_STARTJOIN)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  state &= ~(1 << JS_STARTJOIN);

  octet o = {0, len, joinresponse};
  struct JoinResponse resp;
  if (!deserialize_join_response(&o, &resp) || !join_finish_client(&_priv.pub, &_userPriv, &resp)) {
    return JS_INVALID_DATA;
  }

  state |= (1 << JS_USERCREDS);

  return JS_RETURN_SUCCESS;
}

// Assuming it has already been verified in finishJoin
// TODO: what if the group public key changes? should we include group public key in
// UserPrivateKey? Now we don't require group public key to be set...
int EMSCRIPTEN_KEEPALIVE JS_loadUserPrivKey(char* in, int in_len) {
  state &= ~(1 << JS_STARTJOIN);
  state &= ~(1 << JS_USERCREDS);

  octet o = {0, in_len, in};
  if (!deserialize_user_private_key(&o, &_userPriv)) {
    return JS_INVALID_DATA;
  }

  state |= (1 << JS_USERCREDS);
  return JS_RETURN_SUCCESS;
}
// End - Operations that modify internal state

int EMSCRIPTEN_KEEPALIVE JS_exportGroupPrivKey(char* out, int* out_len) {
  if (!((1 << JS_GROUP_PRIVKEY)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  octet o = {0, *out_len, out};
  if (!serialize_group_private_key(&_priv, &o)) {
    return JS_INVALID_DATA;
  }
  *out_len = o.len;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_exportGroupPubKey(char* out, int* out_len) {
  if (!((1 << JS_GROUP_PUBKEY)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  octet o = {0, *out_len, out};
  if (!serialize_group_public_key(&_priv.pub, &o)) {
    return JS_INVALID_DATA;
  }
  *out_len = o.len;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_exportUserPrivKey(char* out, int* out_len) {
  if (!((1 << JS_USERCREDS)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  octet o = {0, *out_len, out};
  if (!serialize_user_private_key(&_userPriv, &o)) {
    return JS_INVALID_DATA;
  }
  *out_len = o.len;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_processJoin(char* joinmsg, int joinmsg_len, Byte32 challenge, char* out, int* out_len) {
  if (!((1 << JS_GROUP_PRIVKEY)&state || !((1 << JS_SEEDED)&state))) {
    return JS_RETURN_UNINITIALIZED;
  }

  struct JoinMessage join;
  struct JoinResponse resp;
  octet o = {0, joinmsg_len, joinmsg};
  octet oo = {0, *out_len, out};
  if (
    !deserialize_join_message(&o, &join) ||
    !join_server(&_rng, &_priv, &join, challenge, &resp) ||
    !serialize_join_response(&resp, &oo)
  ) {
    return JS_INVALID_DATA;
  }
  *out_len = oo.len;

  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_sign(Byte32 msg, Byte32 bsn, char* signature, int* len) {
  if (!((1 << JS_USERCREDS)&state) || !((1 << JS_SEEDED)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  struct Signature sig;
  sign(&_rng, &_userPriv, msg, bsn, &sig);
  octet o = {0, *len, signature};
  if (!serialize_signature(&sig, &o)) {
    return JS_INVALID_DATA;
  }
  *len = o.len;
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_verify(Byte32 msg, Byte32 bsn, char* signature, int len) {
  if (!((1 << JS_GROUP_PUBKEY)&state)) {
    return JS_RETURN_UNINITIALIZED;
  }
  struct Signature sig;
  octet o = {0, len, signature};
  if (!deserialize_signature(&o, &sig)) {
    return JS_INVALID_DATA;
  }
  if (!verify(msg, bsn, &sig, &_priv.pub)) {
    return JS_RETURN_FAILURE;
  }
  return JS_RETURN_SUCCESS;
}

int EMSCRIPTEN_KEEPALIVE JS_getSignatureTag(char* signature, int sig_len, char* tag, int* tag_len) {
  struct Signature sig;
  octet o = {0, sig_len, signature};
  octet oo = {0, *tag_len, tag};
  if (!deserialize_signature(&o, &sig) || !serialize_signature_tag(&sig, &oo)) {
    return JS_INVALID_DATA;
  }
  *tag_len = oo.len;
  return JS_RETURN_SUCCESS;
}
