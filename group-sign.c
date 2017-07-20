#include "group-sign.h"

#if CURVETYPE==MONTGOMERY
    #define ECPSIZE (MODBYTES+1)
#else
    #define ECPSIZE (2*MODBYTES+1)
#endif

#define ECP2SIZE (4*MODBYTES)

static void setG1(ECP* X)
{
    BIG x, y;
    BIG_rcopy(x, CURVE_Gx);
    BIG_rcopy(y, CURVE_Gy);
    ECP_set(X, x, y);
}

static void setG2(ECP2* X)
{
    FP2 wx,wy;
    BIG_rcopy(wx.a,CURVE_Pxa);
    FP_nres(wx.a);
    BIG_rcopy(wx.b,CURVE_Pxb);
    FP_nres(wx.b);
    BIG_rcopy(wy.a,CURVE_Pya);
    FP_nres(wy.a);
    BIG_rcopy(wy.b,CURVE_Pyb);
    FP_nres(wy.b);
    ECP2_set(X,&wx,&wy);
}

static void randomModOrder(BIG x, csprng *RNG)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);
    BIG_randomnum(x, order, RNG);
}

static void addECP2Hash(hash256* h, ECP2* P)
{
    char tmp[ECP2SIZE];
    octet TMP = {0, sizeof(tmp), tmp};
    ECP2_toOctet(&TMP, P);
    for (int i=0; i<ECP2SIZE; i++) HASH256_process(h,TMP.val[i]);
}

static void addECPHash(hash256* h, ECP* P)
{
    char tmp[ECPSIZE];
    octet TMP = {0, sizeof(tmp), tmp};
    ECP_toOctet(&TMP, P);
    for (int i=0; i<ECPSIZE; i++) HASH256_process(h,TMP.val[i]);
}

static void ECP2challenge(ECP2* G, ECP2* Y, ECP2* T, BIG c)
{
    hash256 sha256;
    HASH256_init(&sha256);

    addECP2Hash(&sha256, G);
    addECP2Hash(&sha256, Y);
    addECP2Hash(&sha256, T);

    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytes(c, hh); // MODBYTES == 32!!!
}

static void ECPchallenge(ECP* G, ECP* Y, ECP* T, octet *message, BIG c)
{
    hash256 sha256;
    HASH256_init(&sha256);

    addECPHash(&sha256, G);
    addECPHash(&sha256, Y);
    addECPHash(&sha256, T);

    if (message) {
        for (int i=0; i<message->len; i++) HASH256_process(&sha256,message->val[i]);
    }

    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytes(c, hh); // MODBYTES == 32!!!
}

// make POK of X such that Y = G ** X
// v is a random integer mod group order
// output is T, r
static void makeECPProof(ECP* G, ECP* Y, BIG x, BIG v, ECP* T, octet *message, BIG r)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);

    ECP_copy(T, G);
    PAIR_G1mul(T, v); // T = G ** v

    // c = H(G, Y, T, message)
    ECPchallenge(G, Y, T, message, r);
    BIG_modmul(r, r, x, order);
    BIG_modneg(r, r, order);
    BIG_add(r, r, v);
    BIG_mod(r, order);
}

static void ECPchallengeEquals(ECP* G1, ECP* G2, ECP* U1, ECP* U2, ECP* A1, ECP* A2, BIG c, octet *extra)
{
    hash256 sha256;
    HASH256_init(&sha256);

    addECPHash(&sha256, G1);
    addECPHash(&sha256, G2);
    addECPHash(&sha256, U1);
    addECPHash(&sha256, U2);
    addECPHash(&sha256, A1);
    addECPHash(&sha256, A2);

    if (extra) {
        for (int i = 0; i < extra->len; ++i) HASH256_process(&sha256, extra->val[i]);
    }

    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytes(c, hh); // MODBYTES == 32!!!
}

static void makeECPProofEquals(ECP* G1, ECP* G2, ECP* U1, ECP* U2, BIG x, BIG r, ECP* A1, ECP* A2, BIG z, octet *extra)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);

    ECP_copy(A1, G1);
    ECP_copy(A2, G2);
    PAIR_G1mul(A1, r);
    PAIR_G1mul(A2, r);

    ECPchallengeEquals(G1, G2, U1, U2, A1, A2, z, extra);

    BIG_modmul(z, z, x, order);
    BIG_add(z, z, r);
    BIG_mod(z, order);
}

// POK of X such that Y = G ** X
// verify that T = (G ** R) * (Y ** C), C = H(G, Y, T)
static int verifyECPProof(ECP* G, ECP* Y, ECP* T, octet *message, BIG r)
{
    BIG c;
    ECPchallenge(G, Y, T, message, c);
    ECP GG, YY;
    ECP_copy(&GG, G);
    ECP_copy(&YY, Y);
    PAIR_G1mul(&GG, r);
    PAIR_G1mul(&YY, c);
    ECP_add(&GG, &YY);
    return ECP_equals(&GG, T);
}

static int verifyECPProofEquals(ECP* G1, ECP* G2, ECP* U1, ECP* U2, ECP* A1, ECP* A2, BIG z, octet *extra)
{
    ECP GG1, GG2, UU1, UU2;
    ECP_copy(&GG1, G1);
    ECP_copy(&GG2, G2);
    ECP_copy(&UU1, U1);
    ECP_copy(&UU2, U2);

    BIG c;
    ECPchallengeEquals(G1, G2, U1, U2, A1, A2, c, extra);

    PAIR_G1mul(&GG1, z);
    PAIR_G1mul(&GG2, z);
    PAIR_G1mul(&UU1, c);
    PAIR_G1mul(&UU2, c);
    ECP_add(&UU1, A1);
    ECP_add(&UU2, A2);
    return ECP_equals(&GG1, &UU1) && ECP_equals(&GG2, &UU2);
}

// make POK of X such that Y = G ** X
// v is a random integer mod group order
// output is T, r
static void makeECP2Proof(ECP2* G, ECP2* Y, BIG x, BIG v, ECP2* T, BIG r)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);

    ECP2_copy(T, G);
    PAIR_G2mul(T, v); // T = G ** v

    // c = H(G, Y, T)
    ECP2challenge(G, Y, T, r);
    BIG_modmul(r, r, x, order);
    BIG_modneg(r, r, order);
    BIG_add(r, r, v);
    BIG_mod(r, order);
}


// POK of X such that Y = G ** X
// verify that T = (G ** R) * (Y ** C), C = H(G, Y, T)
static int verifyECP2Proof(ECP2* G, ECP2* Y, ECP2* T, BIG r)
{
    BIG c;
    ECP2challenge(G, Y, T, c);
    ECP2 GG, YY;
    ECP2_copy(&GG, G);
    ECP2_copy(&YY, Y);
    PAIR_G2mul(&GG, r);
    PAIR_G2mul(&YY, c);
    ECP2_add(&GG, &YY);
    return ECP2_equals(&GG, T);
}

// Do we need e(X, a)· e(X, b) ** m == e(g1, c)? See 4.2
static int verifyAux(ECP* A, ECP* B, ECP* C, ECP* D, ECP2* X, ECP2 *Y)
{
    FP12 w, y;
    ECP2 G2;
    setG2(&G2);

    // a != 1
    if (ECP_isinf(A)) {
        return 0;
    }

    // e(a, Y) == e(b, g2) and e(c, g2) == e(a · d, X)?
    // Can this be optimized?
    PAIR_ate(&w, Y, A);
    PAIR_fexp(&w);
    PAIR_ate(&y, &G2, B);
    PAIR_fexp(&y);
    if (!FP12_equals(&w, &y)) {
        return 0;
    }

    ECP AA;
    ECP_copy(&AA, A);
    ECP_add(&AA, D);
    PAIR_ate(&w, X, &AA);
    PAIR_fexp(&w);
    PAIR_ate(&y, &G2, C);
    PAIR_fexp(&y);
    if (!FP12_equals(&w, &y)) {
        return 0;
    }
    return 1;
}

// n given by server
void join_client(csprng *RNG, octet* n, struct JoinMessage *j, struct UserPrivateKey *priv)
    // BIG gsk, ECP* Q, ECP* T, BIG rr) // output
{
    ECP G;
    setG1(&G);

    ECP_copy(&j->Q, &G);
    randomModOrder(priv->gsk, RNG);
    PAIR_G1mul(&j->Q, priv->gsk);

    ECP_copy(&priv->Q, &j->Q);

    BIG v;
    randomModOrder(v, RNG);
    makeECPProof(&G, &j->Q, priv->gsk, v, &j->T, n, j->r);
}

int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, octet *n, struct JoinResponse *resp)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);

    ECP G;
    setG1(&G);
    int ok = verifyECPProof(&G, &j->Q, &j->T, n, j->r);
    if (ok) {
        ECP *A = &resp->cred.A;
        ECP *B = &resp->cred.B;
        ECP *C = &resp->cred.C;
        ECP *D = &resp->cred.D;
        ECP *Q = &j->Q;

        BIG r;
        randomModOrder(r, RNG);
        ECP_copy(A, &G);
        PAIR_G1mul(A, r);

        ECP_copy(B, A);
        PAIR_G1mul(B, priv->y);

        ECP_copy(D, Q);
        BIG tmp;
        BIG_modmul(tmp, r, priv->y, order);
        PAIR_G1mul(D, tmp);

        ECP_copy(C, A);
        ECP_add(C, D);
        PAIR_G1mul(C, priv->x);

        randomModOrder(r, RNG);

        makeECPProofEquals(&G, Q, B, D, tmp, r, &resp->A1, &resp->A2, resp->z, 0);
    }
    return ok;
}

int setup(csprng *RNG, struct GroupPrivateKey *priv)
{
    // We copy the CURVE_Order (prime) to bignum variable r

    ECP2 W;
    setG2(&W);

    ECP2_copy(&priv->pub.X,&W);
    ECP2_copy(&priv->pub.Y,&W);

    // Choose random x,y less than the group order
    randomModOrder(priv->x, RNG);
    randomModOrder(priv->y, RNG);

    // Compute public keys
    PAIR_G2mul(&priv->pub.X, priv->x);
    PAIR_G2mul(&priv->pub.Y, priv->y);

    // Make POK of discrete-logs for X and Y
    // https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic
    // (https://crypto.stackexchange.com/questions/15758/how-can-we-prove-that-two-discrete-logarithms-are-equal)
    // https://cs.nyu.edu/courses/spring07/G22.3220-001/lec3.pdf
    // ECP2_copy(&T,&W);
    BIG v;
    randomModOrder(v, RNG);

    // Is it ok to reuse v and T? Any vulnerability?
    makeECP2Proof(&W, &priv->pub.X, priv->x, v, &priv->pub.T, priv->pub.rx);
    makeECP2Proof(&W, &priv->pub.Y, priv->y, v, &priv->pub.T, priv->pub.ry); // We are doing extra computation here of T = W ** v

    return 0;
}

int verifyGroupPublicKey(struct GroupPublicKey *pub)
{
    ECP2 W;
    setG2(&W);

    return verifyECP2Proof(&W, &pub->X, &pub->T, pub->rx)
        && verifyECP2Proof(&W, &pub->Y, &pub->T, pub->ry);
}

// FIXME!!: WHY Fig4. Protocol is different than the explanation?
// Can we optimize with multipairing?? PAIR_double_ate
// int verifyAux(ECP* A, ECP* B, ECP* C, ECP* D, ECP2* X, ECP2 *Y)
// {
//     FP12 w, y;
//     ECP2 G2;
//     setG2(&G2);

//     // a != 1
//     if (ECP_isinf(A)) {
//         return 0;
//     }



//     // e(a, Y) == e(b, g2) and e(c, g2) == e(a · d, X)?
//     // Can this be optimized?
//     PAIR_double_ate(&w, X, A, Y, C);
//     PAIR_fexp(&w);
//     PAIR_ate(&y, &G2, B);
//     PAIR_fexp(&y);
//     if (!FP12_equals(&w, &y)) {
//         return 0;
//     }

//     return 1;
// }



int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp)
{
    ECP G;
    setG1(&G);

    if (!verifyECPProofEquals(&G, &priv->Q, &resp->cred.B, &resp->cred.D, &resp->A1, &resp->A2, resp->z, 0)) {
        return 0;
    }

    if (!verifyAux(&resp->cred.A, &resp->cred.B, &resp->cred.C, &resp->cred.D, &pub->X, &pub->Y)) {
        return 0;
    }


    // FP12 w, y;
    // ECP2 G2;
    // setG2(&G2);

    // // a != 1
    // if (ECP_isinf(&resp->cred.A)) {
    //     return 0;
    // }

    // // e(a, Y) == e(b, g2) and e(c, g2) == e(a · d, X)?
    // // Can this be optimized?
    // PAIR_ate(&w, &pub->Y, &resp->cred.A);
    // PAIR_fexp(&w);
    // PAIR_ate(&y, &G2, &resp->cred.B);
    // PAIR_fexp(&y);
    // if (!FP12_equals(&w, &y)) {
    //     return 0;
    // }

    // ECP AA;
    // ECP_copy(&AA, &resp->cred.A);
    // ECP_add(&AA, &resp->cred.D);
    // PAIR_ate(&w, &pub->X, &AA);
    // PAIR_fexp(&w);
    // PAIR_ate(&y, &G2, &resp->cred.C);
    // PAIR_fexp(&y);
    // if (!FP12_equals(&w, &y)) {
    //     return 0;
    // }

    ECP_copy(&priv->cred.A, &resp->cred.A);
    ECP_copy(&priv->cred.B, &resp->cred.B);
    ECP_copy(&priv->cred.C, &resp->cred.C);
    ECP_copy(&priv->cred.D, &resp->cred.D);

    return 1;
}

// msg and octet len should be 32 bytes!!! just do sha256 before.
void sign(csprng *RNG, struct UserPrivateKey *priv, octet *msg, octet *bsn, struct Signature *sig)
{
    int i;
    // TODO: limit msg and bsn sizes
    char hh_msg[32], hh_bsn[32], hh_msg_bsn[32];
    hash256 h_msg;
    hash256 h_bsn;
    hash256 h_msg_bsn;
    HASH256_init(&h_msg);
    HASH256_init(&h_bsn);
    HASH256_init(&h_msg_bsn);
    for (i=0; i < msg->len; i++) HASH256_process(&h_msg, msg->val[i]);
    for (i=0; i < bsn->len; i++) HASH256_process(&h_bsn, bsn->val[i]);
    HASH256_hash(&h_msg, hh_msg);
    HASH256_hash(&h_bsn, hh_bsn);
    for (i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, hh_msg[i]);
    for (i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, hh_bsn[i]);
    HASH256_hash(&h_msg_bsn, hh_msg_bsn);

    octet HH_MSG_BSN = {32, 32, hh_msg_bsn};

    ECP G;
    setG1(&G);

    BIG r;
    randomModOrder(r, RNG);

    ECP_copy(&sig->A, &priv->cred.A);
    ECP_copy(&sig->B, &priv->cred.B);
    ECP_copy(&sig->C, &priv->cred.C);
    ECP_copy(&sig->D, &priv->cred.D);

    PAIR_G1mul(&sig->A, r);
    PAIR_G1mul(&sig->B, r);
    PAIR_G1mul(&sig->C, r);
    PAIR_G1mul(&sig->D, r);

    BIG bsnExp;
    BIG_fromBytes(bsnExp, hh_bsn);
    ECP BSN;
    ECP_copy(&BSN, &G);
    ECP_mul(&BSN, bsnExp);
    ECP_copy(&sig->NYM, &BSN);
    PAIR_G1mul(&sig->NYM, priv->gsk);

    randomModOrder(r, RNG);
    makeECPProofEquals(&sig->B, &BSN, &sig->D, &sig->NYM, priv->gsk, r, &sig->A1, &sig->A2, sig->z, &HH_MSG_BSN);
}

int verify(octet *msg, octet *bsn, struct Signature *sig, struct GroupPublicKey *pub)
{
    int i;
    // TODO: limit msg and bsn sizes
    char hh_msg[32], hh_bsn[32], hh_msg_bsn[32];
    hash256 h_msg;
    hash256 h_bsn;
    hash256 h_msg_bsn;
    HASH256_init(&h_msg);
    HASH256_init(&h_bsn);
    HASH256_init(&h_msg_bsn);
    for (i=0; i < msg->len; i++) HASH256_process(&h_msg, msg->val[i]);
    for (i=0; i < bsn->len; i++) HASH256_process(&h_bsn, bsn->val[i]);
    HASH256_hash(&h_msg, hh_msg);
    HASH256_hash(&h_bsn, hh_bsn);
    for (i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, hh_msg[i]);
    for (i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, hh_bsn[i]);
    HASH256_hash(&h_msg_bsn, hh_msg_bsn);

    octet HH_MSG_BSN = {32, 32, hh_msg_bsn};

    ECP G;
    setG1(&G);

    BIG bsnExp;
    BIG_fromBytes(bsnExp, hh_bsn);
    ECP BSN;
    ECP_copy(&BSN, &G);
    ECP_mul(&BSN, bsnExp);

    // NYM should be the same for different messages as long as the
    // basename (BSN) is the same (and the user private key, group key, etc. are the same), and different otherwise.

    // The rest of the signature should always be different for every signature, even if the signed message is the same
    // ECP_output(&sig->NYM);
    // ECP_output(&sig->A);
    // ECP_output(&sig->B);
    // ECP_output(&sig->C);
    // ECP_output(&sig->D);
    // ECP_output(&sig->A1);
    // ECP_output(&sig->A2);

    return verifyECPProofEquals(&sig->B, &BSN, &sig->D, &sig->NYM, &sig->A1, &sig->A2, sig->z, &HH_MSG_BSN)
     && !ECP_isinf(&sig->A) && !ECP_isinf(&sig->B)
     && verifyAux(&sig->A, &sig->B, &sig->C, &sig->D, &pub->X, &pub->Y);
}
