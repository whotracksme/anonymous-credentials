#pragma once

#include "amcl.h"

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
    ECP Q; // G1 ** gsk, redundant
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

// n given by server
// BIG gsk, ECP* Q, ECP* T, BIG rr) // output
void join_client(csprng *RNG, char* n, struct JoinMessage *j, struct UserPrivateKey *priv);

int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, char *n, struct JoinResponse *resp);

int setup(csprng *RNG, struct GroupPrivateKey *priv);

int verifyGroupPublicKey(struct GroupPublicKey *pub);

int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp);

// msg and octet len should be 32 bytes!!! just do sha256 before.
void sign(csprng *RNG, struct UserPrivateKey *priv, char *msg, char *bsn, struct Signature *sig);

// msg and octet len should be 32 bytes!!! just do sha256 before.
int verify(char *msg, char *bsn, struct Signature *sig, struct GroupPublicKey *pub);
