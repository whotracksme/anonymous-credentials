#pragma once

#include "amcl.h"

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
int serialize_group_public_key(struct GroupPublicKey* in, octet* out);
int deserialize_group_public_key(octet* in, struct GroupPublicKey* out);

int serialize_group_private_key(struct GroupPrivateKey* in, octet* out);
int deserialize_group_private_key(octet* in, struct GroupPrivateKey* out);

int serialize_join_message(struct JoinMessage* in, octet* out);
int deserialize_join_message(octet* in, struct JoinMessage* out);

int serialize_join_response(struct JoinResponse* in, octet* out);
int deserialize_join_response(octet* in, struct JoinResponse* out);

int serialize_user_private_key(struct UserPrivateKey* in, octet* out);
int deserialize_user_private_key(octet* in, struct UserPrivateKey* out);

int serialize_signature(struct Signature* in, octet* out);
int deserialize_signature(octet* in, struct Signature* out);

int serialize_signature_tag(struct Signature* in, octet* out);

// n given by server
// BIG gsk, ECP* Q, ECP* T, BIG rr) // output
void join_client(csprng *RNG, Byte32 challenge, struct JoinMessage *j, struct UserPrivateKey *priv);

int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, Byte32 challenge, struct JoinResponse *resp);

int setup(csprng *RNG, struct GroupPrivateKey *priv);

int verifyGroupPublicKey(struct GroupPublicKey *pub);

int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp);

// msg and octet len should be 32 bytes!!! just do sha256 before.
void sign(csprng *RNG, struct UserPrivateKey *priv, Byte32 msg, Byte32 bsn, struct Signature *sig);

// msg and octet len should be 32 bytes!!! just do sha256 before.
int verify(Byte32 msg, Byte32 bsn, struct Signature *sig, struct GroupPublicKey *pub);
