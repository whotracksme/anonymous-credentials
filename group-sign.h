#pragma once

#include "amcl.h"

struct GroupPublicKey {
    ECP2 X; // G2 ** x
    ECP2 Y; // G2 ** y

    // ZK of discrete-log knowledge for X and Y
    // c = H(G2, Q, T)
    // T == (G2 ** rx) * (X ** c)
    // T == (G2 ** ry) * (Y ** c)
    ECP2 T;
    BIG rx;
    BIG ry;
};

struct GroupPrivateKey {
    struct GroupPublicKey pub;
    BIG x;
    BIG y;
};

struct JoinMessage {
    ECP Q; // G1 ** gsk

    // c = H(G1, Q, T, message)
    // T == (G1 ** r) * (Q ** c)
    ECP T;
    BIG r;
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
    // Q = G1 ** gsk
    // c = H(G1, Q, B, D, A1, A2)
    // (G1 ** z) == A1 * (cred.B ** c)
    // (Q ** z) == A2 * (cred.D ** c)
    ECP A1;
    ECP A2;
    BIG z;
};

struct Signature {
    ECP A;
    ECP B;
    ECP C;
    ECP D;
    ECP NYM;

    // Q = G1 ** gsk
    // c = H(G1, Q, B, D, A1, A2)
    // (G1 ** z) == A1 * (cred.B ** c)
    // (Q ** z) == A2 * (cred.D ** c)
    ECP A1;
    ECP A2;
    BIG z;
};

// n given by server
// BIG gsk, ECP* Q, ECP* T, BIG rr) // output
void join_client(csprng *RNG, octet* n, struct JoinMessage *j, struct UserPrivateKey *priv);

int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, octet *n, struct JoinResponse *resp);

int setup(csprng *RNG, struct GroupPrivateKey *priv);

int verifyGroupPublicKey(struct GroupPublicKey *pub);

int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp);

// msg and octet len should be 32 bytes!!! just do sha256 before.
void sign(csprng *RNG, struct UserPrivateKey *priv, octet *msg, octet *bsn, struct Signature *sig);

int verify(octet *msg, octet *bsn, struct Signature *sig, struct GroupPublicKey *pub);
