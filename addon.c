#include <node_api.h>
#include <assert.h>
#include <stdlib.h>

extern void* GS_createState();
extern void GS_destroyState(void* state);

extern int GS_seed(void* state, char* seed, int seed_length);
extern int GS_setupGroup(void* state);
extern int GS_loadGroupPrivKey(void* state, char* data, int len);
extern int GS_loadGroupPubKey(void* state, char* data, int len);
extern int GS_loadUserPrivKey(void* state, char* in, int in_len);
extern int GS_exportGroupPrivKey(void* state, char* out, int* out_len);
extern int GS_exportGroupPubKey(void* state, char* out, int* out_len);
extern int GS_exportUserPrivKey(void* state, char* out, int* out_len);
extern int GS_processJoin(void* state, char* joinmsg, int joinmsg_len, char* challenge, int challenge_len, char* out, int* out_len);
extern int GS_sign(void* state, char* msg, int msg_len, char* bsn, int bsn_len, char* signature, int* len);
extern int GS_verify(void* state, char* msg, int msg_len, char* bsn, int bsn_len, char* signature, int len);
extern int GS_getSignatureTag(char* signature, int sig_len, char* tag, int* tag_len);
extern int GS_startJoinStatic(
  void* state,
  char* challenge, // in
  int challenge_len, // in
  char* gsk, int* len_gsk, // out
  char* joinmsg, int* len // out
);

extern int GS_finishJoinStatic(
  char* publickey, int len_publickey, // in
  char* gsk, int len_gsk, // in
  char* joinresponse, int len, // in
  char* credentials, int* len_credentials // out
);

extern const char* GS_version();
extern const char* GS_big();
extern const char* GS_field();
extern const char* GS_curve();

#define DECLARE_NAPI_METHOD(name, func) \
  { name, 0, func, 0, 0, 0, napi_default, 0 }

#define DECLARE_NAPI_STATIC(name, value) \
  { name, 0, 0, 0, 0, value, napi_static, 0 }

#define NAPI_CALL(call) (assert(call == napi_ok))

#define GS_CALL(call) \
  if (call != 1) { \
    NAPI_CALL(napi_throw_error(env, NULL, "Wrong input data or state")); \
    return NULL; \
  }

typedef struct {
  napi_env env_;
  napi_ref wrapper_;

  void* state;
} GroupSigner;

void Destructor(napi_env env, void* nativeObject, void* finalize_hint) {
  GroupSigner* obj = (GroupSigner*) nativeObject;
  GS_destroyState(obj->state);
  napi_delete_reference(obj->env_, obj->wrapper_);
  free(nativeObject);
}

napi_ref constructor;

napi_value New(napi_env env, napi_callback_info info) {
  napi_value is_constructor;
  NAPI_CALL(napi_get_new_target(env, info, &is_constructor));

  if (is_constructor) {
    size_t argc = 1;
    napi_value args[1];
    napi_value jsthis;
    NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));

    GroupSigner* obj = (GroupSigner *) malloc(sizeof(GroupSigner));
    obj->state = GS_createState();
    obj->env_ = env;

    NAPI_CALL(napi_wrap(env,
                       jsthis,
                       (void*)obj,
                       Destructor,
                       NULL,
                       &obj->wrapper_));
    return jsthis;
  } else {
    size_t argc_ = 1;
    napi_value args[1];
    NAPI_CALL(napi_get_cb_info(env, info, &argc_, args, NULL, NULL));

    const size_t argc = 1;
    napi_value argv[] = {args[0]};

    napi_value cons;
    NAPI_CALL(napi_get_reference_value(env, constructor, &cons));

    napi_value instance;
    NAPI_CALL(napi_new_instance(env, cons, argc, argv, &instance));

    return instance;
  }
}

char* getData(napi_env env, napi_value value, size_t* out_len) {
  *out_len = 0;

  bool is_typedarray;
  NAPI_CALL(napi_is_typedarray(env, value, &is_typedarray));

  if (!is_typedarray) {
    return NULL;
  }

  napi_typedarray_type type;
  napi_value input_buffer;
  size_t byte_offset;
  size_t length;
  NAPI_CALL(napi_get_typedarray_info(
    env, value, &type, &length, NULL, &input_buffer, &byte_offset
  ));

  if (type != napi_uint8_array || length <= 0) {
    return NULL;
  }

  char* data;
  size_t byte_length;
  NAPI_CALL(napi_get_arraybuffer_info(
   env, input_buffer, (void**)(&data), &byte_length));
  *out_len = length;
  return &data[byte_offset];
}

napi_value getUndefined(napi_env env) {
  napi_value result;
  NAPI_CALL(napi_get_undefined(env, &result));
  return result;
}

napi_value getBoolean(napi_env env, bool value) {
  napi_value result;
  NAPI_CALL(napi_get_boolean(env, value, &result));
  return result;
}

napi_value Seed(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len;
  char* data = getData(env, args[0], &len);

  GS_CALL(GS_seed(obj->state, data, len))

  return getUndefined(env);
}

napi_value SetupGroup(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  // napi_value args[0];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, NULL, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  GS_CALL(GS_setupGroup(obj->state))

  return getUndefined(env);
}

napi_value GetGroupPubKey(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  // napi_value args[0];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, NULL, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  char buf[4096];
  int out_len = sizeof(buf);
  GS_CALL(GS_exportGroupPubKey(obj->state, buf, &out_len))

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value GetGroupPrivKey(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  // napi_value args[0];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, NULL, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  char buf[4096];
  int out_len = sizeof(buf);
  GS_CALL(GS_exportGroupPrivKey(obj->state, buf, &out_len))

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value SetGroupPubKey(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len;
  char* data = getData(env, args[0], &len);

  GS_CALL(GS_loadGroupPubKey(obj->state, data, len))

  return getUndefined(env);
}

napi_value SetGroupPrivKey(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len;
  char* data = getData(env, args[0], &len);

  GS_CALL(GS_loadGroupPrivKey(obj->state, data, len))

  return getUndefined(env);
}

napi_value ProcessJoin(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value args[2];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len_join;
  char* join = getData(env, args[0], &len_join);

  size_t len_challenge;
  char* challenge = getData(env, args[1], &len_challenge);
  if (len_challenge != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "Challenge must be exactly 32 bytes long"));
    return NULL;
  }

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_processJoin(obj->state, join, len_join, challenge, len_challenge, buf, &out_len));

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value Sign(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value args[2];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len_msg;
  char* msg = getData(env, args[0], &len_msg);
  if (len_msg != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "msg must be exactly 32 bytes long"));
    return NULL;
  }

  size_t len_bsn;
  char* bsn = getData(env, args[1], &len_bsn);
  if (len_bsn != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "bsn must be exactly 32 bytes long"));
    return NULL;
  }

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_sign(obj->state, msg, len_msg, bsn, len_bsn, buf, &out_len));

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value Verify(napi_env env, napi_callback_info info) {
  size_t argc = 3;
  napi_value args[3];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len_msg;
  char* msg = getData(env, args[0], &len_msg);
  if (len_msg != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "msg must be exactly 32 bytes long"));
    return NULL;
  }

  size_t len_bsn;
  char* bsn = getData(env, args[1], &len_bsn);
  if (len_bsn != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "bsn must be exactly 32 bytes long"));
    return NULL;
  }

  size_t len_sig;
  char* sig = getData(env, args[2], &len_sig);

  return getBoolean(env, GS_verify(obj->state, msg, len_msg, bsn, len_bsn, sig, len_sig) == 1);
}

napi_value GetSignatureTag(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));

  size_t len_sig;
  char* sig = getData(env, args[0], &len_sig);

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_getSignatureTag(sig, len_sig, buf, &out_len));

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value GetUserPrivKey(napi_env env, napi_callback_info info) {
  size_t argc = 0;
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, NULL, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_exportUserPrivKey(obj->state, buf, &out_len))

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));
  return out_buf;
}

napi_value SetUserPrivKey(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len;
  char* data = getData(env, args[0], &len);

  GS_CALL(GS_loadUserPrivKey(obj->state, data, len))

  return getUndefined(env);
}

napi_value StartJoinStatic(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));
  GroupSigner* obj;
  NAPI_CALL(napi_unwrap(env, jsthis, (void**)(&obj)));

  size_t len;
  char* data = getData(env, args[0], &len);
  if (len != 32) {
    NAPI_CALL(napi_throw_error(env, NULL, "Challenge must be exactly 32 bytes long"));
    return NULL;
  }

  char bufgsk[1024];
  int outgsk_len = sizeof(bufgsk);

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_startJoinStatic(obj->state, data, len, bufgsk, &outgsk_len, buf, &out_len));

  napi_value outgsk_buf;
  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, outgsk_len, bufgsk, NULL, &outgsk_buf));
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));

  napi_value out_obj;
  NAPI_CALL(napi_create_object(env, &out_obj));
  napi_set_named_property(env, out_obj, "gsk", outgsk_buf);
  napi_set_named_property(env, out_obj, "joinmsg", out_buf);
  return out_obj;
}

napi_value FinishJoinStatic(napi_env env, napi_callback_info info) {
  size_t argc = 3;
  napi_value args[3];
  napi_value jsthis;
  NAPI_CALL(napi_get_cb_info(env, info, &argc, args, &jsthis, NULL));

  size_t len_publickey;
  char* publickey = getData(env, args[0], &len_publickey);

  size_t len_gsk;
  char* gsk = getData(env, args[1], &len_gsk);

  size_t len_join;
  char* join = getData(env, args[2], &len_join);

  char buf[1024];
  int out_len = sizeof(buf);
  GS_CALL(GS_finishJoinStatic(publickey, len_publickey, gsk, len_gsk, join, len_join, buf, &out_len));

  napi_value out_buf;
  NAPI_CALL(napi_create_buffer_copy(
       env, out_len, buf, NULL, &out_buf));

  return out_buf;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_value version, big, field, curve;
  NAPI_CALL(napi_create_string_utf8(env, GS_version(), NAPI_AUTO_LENGTH, &version));
  NAPI_CALL(napi_create_string_utf8(env, GS_big(), NAPI_AUTO_LENGTH, &big));
  NAPI_CALL(napi_create_string_utf8(env, GS_field(), NAPI_AUTO_LENGTH, &field));
  NAPI_CALL(napi_create_string_utf8(env, GS_curve(), NAPI_AUTO_LENGTH, &curve));

  napi_property_descriptor properties[] = {
    DECLARE_NAPI_METHOD("seed", Seed),
    DECLARE_NAPI_METHOD("setupGroup", SetupGroup),
    DECLARE_NAPI_METHOD("getGroupPubKey", GetGroupPubKey),
    DECLARE_NAPI_METHOD("getGroupPrivKey", GetGroupPrivKey),
    DECLARE_NAPI_METHOD("setGroupPubKey", SetGroupPubKey),
    DECLARE_NAPI_METHOD("setGroupPrivKey", SetGroupPrivKey),
    DECLARE_NAPI_METHOD("processJoin", ProcessJoin),
    DECLARE_NAPI_METHOD("sign", Sign),
    DECLARE_NAPI_METHOD("verify", Verify),
    DECLARE_NAPI_METHOD("getSignatureTag", GetSignatureTag),
    DECLARE_NAPI_METHOD("getUserPrivKey", GetUserPrivKey),
    DECLARE_NAPI_METHOD("setUserPrivKey", SetUserPrivKey),
    DECLARE_NAPI_METHOD("startJoinStatic", StartJoinStatic),
    DECLARE_NAPI_METHOD("finishJoinStatic", FinishJoinStatic),

    DECLARE_NAPI_STATIC("_version", version),
    DECLARE_NAPI_STATIC("_big", big),
    DECLARE_NAPI_STATIC("_field", field),
    DECLARE_NAPI_STATIC("_curve", curve)
  };

  napi_value cons;
  NAPI_CALL(napi_define_class(env, "GroupSigner", NAPI_AUTO_LENGTH, New, NULL, sizeof(properties)/sizeof(napi_property_descriptor), properties, &cons));
  NAPI_CALL(napi_create_reference(env, cons, 1, &constructor));
  NAPI_CALL(napi_set_named_property(env, exports, "GroupSigner", cons));

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
