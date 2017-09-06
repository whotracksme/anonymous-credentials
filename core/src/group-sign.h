#pragma once

#ifdef __cplusplus
extern "C" {
#endif

// workaround to allow using the library from C++
#ifdef __cplusplus
#define C99
#endif

#include "amcl.h"

#include "ecp_BN254.h"
#include "ecp2_BN254.h"
#include "big_256_56.h"
#include "pair_BN254.h"

#ifdef __cplusplus
#undef C99
#endif

// TODO: replacing macros by functions would improve tool support
typedef FP_BN254   FP;
#define FP_rcopy FP_BN254_rcopy
#define FP_rcopy FP_BN254_rcopy
typedef FP2_BN254  FP2;
typedef FP12_BN254 FP12;
#define FP12_equals FP12_BN254_equals

#define Modulus     Modulus_BN254
#define MODBYTES    MODBYTES_256_56
#define CURVE_Cof   CURVE_Cof_BN254
#define CURVE_Gx    CURVE_Gx_BN254
#define CURVE_Gy    CURVE_Gy_BN254
#define CURVE_Pxa   CURVE_Pxa_BN254
#define CURVE_Pxb   CURVE_Pxb_BN254
#define CURVE_Pya   CURVE_Pya_BN254
#define CURVE_Pyb   CURVE_Pyb_BN254
#define CURVE_Order CURVE_Order_BN254

typedef ECP_BN254 ECP;
#define ECP_get    ECP_BN254_get
#define ECP_set    ECP_BN254_set
#define ECP_setx   ECP_BN254_setx
#define ECP_add    ECP_BN254_add
#define ECP_mul    ECP_BN254_mul
#define ECP_copy   ECP_BN254_copy
#define ECP_isinf  ECP_BN254_isinf
#define ECP_output ECP_BN254_output

typedef ECP2_BN254 ECP2;
#define ECP2_get       ECP2_BN254_get
#define ECP2_set       ECP2_BN254_set
#define ECP2_add       ECP2_BN254_add
#define ECP2_copy      ECP2_BN254_copy
#define ECP2_equals    ECP2_BN254_equals
#define ECP2_fromOctet ECP2_BN254_fromOctet
#define ECP2_toOctet   ECP2_BN254_toOctet
#define ECP2_output    ECP2_BN254_output

typedef BIG_256_56 BIG;
#define BIG_get          BIG_256_56_get
#define BIG_inc          BIG_256_56_inc
#define BIG_add          BIG_256_56_add
#define BIG_comp         BIG_256_56_comp
#define BIG_mod          BIG_256_56_mod
#define BIG_modneg       BIG_256_56_modneg
#define BIG_fromBytes    BIG_256_56_fromBytes
#define BIG_toBytes      BIG_256_56_toBytes
#define BIG_fromBytesLen BIG_256_56_fromBytesLen
#define BIG_copy         BIG_256_56_copy
#define BIG_rcopy        BIG_256_56_rcopy
#define BIG_randomnum    BIG_256_56_randomnum
#define BIG_norm         BIG_256_56_norm
#define BIG_modmul       BIG_256_56_modmul
#define BIG_output       BIG_256_56_output

#define PAIR_G1mul       PAIR_BN254_G1mul
#define PAIR_G2mul       PAIR_BN254_G2mul
#define PAIR_fexp        PAIR_BN254_fexp
#define PAIR_ate         PAIR_BN254_ate

typedef char Byte32[32];

struct GroupPublicKey {
    ECP2 X; // G2 ** x
    ECP2 Y; // G2 ** y

    // ZK of discrete-log knowledge for X and Y
    BIG cx;
    BIG sx;
    BIG cy;
    BIG sy;
};

struct GroupPrivateKey {
    struct GroupPublicKey pub;
    BIG x;
    BIG y;
};

struct JoinMessage {
    ECP Q; // G1 ** gsk

    BIG c;
    BIG s;
};

struct UserCredentials {
    ECP A;
    ECP B;
    ECP C;
    ECP D;
};

struct UserPrivateKey {
    struct UserCredentials cred;
    BIG gsk;
};

struct JoinResponse {
    struct UserCredentials cred;
    BIG c;
    BIG s;
};

struct Signature {
    ECP A;
    ECP B;
    ECP C;
    ECP D;
    ECP NYM;

    BIG c;
    BIG s;
};

// Serializers and deserializers could be automatically generated...
extern int serialize_group_public_key(struct GroupPublicKey* in, octet* out);
extern int deserialize_group_public_key(octet* in, struct GroupPublicKey* out);

extern int serialize_group_private_key(struct GroupPrivateKey* in, octet* out);
extern int deserialize_group_private_key(octet* in, struct GroupPrivateKey* out);

extern int serialize_join_message(struct JoinMessage* in, octet* out);
extern int deserialize_join_message(octet* in, struct JoinMessage* out);

extern int serialize_join_response(struct JoinResponse* in, octet* out);
extern int deserialize_join_response(octet* in, struct JoinResponse* out);

extern int serialize_user_private_key(struct UserPrivateKey* in, octet* out);
extern int deserialize_user_private_key(octet* in, struct UserPrivateKey* out);

extern int serialize_signature(struct Signature* in, octet* out);
extern int deserialize_signature(octet* in, struct Signature* out);

extern int serialize_signature_tag(struct Signature* in, octet* out);

// n given by server
// BIG gsk, ECP* Q, ECP* T, BIG rr) // output
extern void join_client(csprng *RNG, Byte32 challenge, struct JoinMessage *j, struct UserPrivateKey *priv);

extern int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, Byte32 challenge, struct JoinResponse *resp);

extern int setup(csprng *RNG, struct GroupPrivateKey *priv);

extern int verifyGroupPublicKey(struct GroupPublicKey *pub);

extern int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp);

// msg and octet len should be 32 bytes!!! just do sha256 before.
extern void sign(csprng *RNG, struct UserPrivateKey *priv, Byte32 msg, Byte32 bsn, struct Signature *sig);

// msg and octet len should be 32 bytes!!! just do sha256 before.
extern int verify(Byte32 msg, Byte32 bsn, struct Signature *sig, struct GroupPublicKey *pub);



// "bindings" -> these are the external interface

enum ReturnCodes {
  GS_RETURN_FAILURE,
  GS_RETURN_SUCCESS,
  GS_RETURN_UNINITIALIZED,
  GS_INVALID_DATA,
};

enum StateFlags {
  GS_SEEDED,
  GS_GROUP_PRIVKEY,
  GS_GROUP_PUBKEY,
  GS_STARTJOIN,
  GS_USERCREDS,
};

typedef struct {
  csprng _rng;
  struct GroupPrivateKey _priv;
  struct UserPrivateKey _userPriv;
  int state;
} GS_State;


extern void* GS_createState();

extern void GS_destroyState(void* state);

extern int GS_seed(void* state, char* seed, int seed_length);

extern int GS_setupGroup(void* state);

extern int GS_loadGroupPrivKey(void* state, char* data, int len);

extern int GS_loadGroupPubKey(void* state, char* data, int len);

extern int GS_startJoin(void* state, Byte32 challenge, char* joinmsg, int* len);

extern int GS_finishJoin(void* state, char* joinresponse, int len);

// Assuming it has already been verified in finishJoin
// TODO: what if the group public key changes? should we include group public key in
// UserPrivateKey? Now we don't require group public key to be set...
extern int GS_loadUserPrivKey(void* state, char* in, int in_len);
// End - Operations that modify internal state

extern int GS_exportGroupPrivKey(void* state, char* out, int* out_len);

extern int GS_exportGroupPubKey(void* state, char* out, int* out_len);

extern int GS_exportUserPrivKey(void* state, char* out, int* out_len);

extern int GS_processJoin(void* state, char* joinmsg, int joinmsg_len, Byte32 challenge, char* out, int* out_len);

extern int GS_sign(void* state, Byte32 msg, Byte32 bsn, char* signature, int* len);

extern int GS_verify(void* state, Byte32 msg, Byte32 bsn, char* signature, int len);

extern int GS_getSignatureTag(char* signature, int sig_len, char* tag, int* tag_len);

#ifdef __cplusplus
} // end extern "C"
#endif
