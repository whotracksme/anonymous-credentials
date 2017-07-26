#include "group-sign.h"

#define ECPSIZE (2*MODBYTES)
#define ECP2SIZE (4*MODBYTES)
#define BIGSIZE MODBYTES

static int serialize_BIG(BIG* in, octet* out)
{
  int len = out->len;
  out->len += BIGSIZE;
  if (out->len <= out->max) {
    BIG_toBytes(&out->val[len], *in);
    return 1;
  }
  return 0;
}
static int deserialize_BIG(octet* in, BIG* out)
{
  int len = in->len;
  in->len += BIGSIZE;
  if (in->len <= in->max) {
    BIG_fromBytes(*out, &in->val[len]);
    return 1;
  }
  return 0;
}

static int serialize_ECP2(ECP2* in, octet* out)
{
  int len = out->len;
  out->len += ECP2SIZE;
  if (out->len <= out->max) {
    octet tmp = {0, out->max - len, &out->val[len]};
    ECP2_toOctet(&tmp, in);
    return 1;
  }
  return 0;
}
static int deserialize_ECP2(octet* in, ECP2* out)
{
  int len = in->len;
  in->len += ECP2SIZE;
  if (in->len <= in->max) {
    octet tmp = {0, in->max - len, &in->val[len]};
    return ECP2_fromOctet(out, &tmp) && 1;
  }
  return 0;
}

static int serialize_ECP(ECP* in, octet* out)
{
  int len = out->len;
  out->len += ECPSIZE;
  if (out->len <= out->max) {
    // ECP_toOctet uses an extra byte to indicate MONTGOMERY/WEIERSTRASS form
    // but we don't: just WEIERSTRASS
    octet tmp = {0, out->max - len, &out->val[len]};
    BIG x,y;
    ECP_get(x,y,in);
    BIG_toBytes(&tmp.val[0], x);
    BIG_toBytes(&tmp.val[MODBYTES], y);
    return 1;
  }
  return 0;
}
static int deserialize_ECP(octet* in, ECP* out)
{
  int len = in->len;
  in->len += ECPSIZE;
  if (in->len <= in->max) {
    octet tmp = {0, in->max - len, &in->val[len]};
    BIG x,y;
    BIG_fromBytes(x,&(tmp.val[0]));
    BIG_fromBytes(y,&(tmp.val[MODBYTES]));
    return ECP_set(out,x,y) && 1;
  }
  return 0;
}

/* map octet string containing hash to point on curve of correct order */
// from milagro-crypto-c (mpin.c)
static void mapit(char *h,ECP *P)
{
    BIG q,x,c;
    BIG_fromBytes(x,h);
    BIG_rcopy(q,Modulus);
    BIG_mod(x,q);

    while (!ECP_setx(P,x,0))
        BIG_inc(x,1);

    BIG_rcopy(c,CURVE_Cof);
    ECP_mul(P,c);
}

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
    octet TMP = {0, ECPSIZE, tmp};
    serialize_ECP(P, &TMP);
    for (int i=0; i<ECPSIZE; i++) HASH256_process(h,TMP.val[i]);
}

static void ECP2challenge(ECP2* Y, ECP2* G, ECP2* GR, BIG c)
{
    hash256 sha256;
    HASH256_init(&sha256);

    addECP2Hash(&sha256, Y);
    addECP2Hash(&sha256, G);
    addECP2Hash(&sha256, GR);

    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytesLen(c, hh, 32);
    BIG order;
    BIG_rcopy(order, CURVE_Order);
    BIG_mod(c, order);
    BIG_norm(c); // Needed?
}

// perhaps could refector with templates
// assuming message is 32 bytes long (or null pointer)
static void ECPchallenge(Byte32 message, ECP* Y, ECP* G, ECP* GR, BIG c)
{
    hash256 sha256;
    HASH256_init(&sha256);
    if (message) {
      for (int i = 0; i < 32; ++i) {
        HASH256_process(&sha256, message[i]);
      }
    }
    addECPHash(&sha256, Y);
    addECPHash(&sha256, G);
    addECPHash(&sha256, GR);
    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytesLen(c, hh, 32);
    BIG order;
    BIG_rcopy(order, CURVE_Order);
    BIG_mod(c, order);
    BIG_norm(c); // Needed?
}

// make POK of X such that Y = G ** X
// v is a random integer mod group order
// output is T, r
static void makeECPProof(csprng* RNG, ECP* G, ECP* Y, BIG x, char *message, BIG c, BIG s)
{
    BIG r, order;
    randomModOrder(r, RNG);
    ECP GR;
    ECP_copy(&GR, G);
    PAIR_G1mul(&GR, r);
    ECPchallenge(message, Y, G, &GR, c);
    BIG_rcopy(order, CURVE_Order);
    BIG_modmul(s, c, x, order);
    BIG_modneg(s, s, order);
    BIG_add(s, s, r);
    BIG_mod(s, order);
}

static void ECPchallengeEquals(Byte32 message, ECP* Y, ECP* Z, ECP* A, ECP* B, ECP* AR, ECP* BR, BIG c)
{
    hash256 sha256;
    HASH256_init(&sha256);

    if (message) {
        for (int i = 0; i < 32; ++i) HASH256_process(&sha256, message[i]);
    }

    addECPHash(&sha256, Y);
    addECPHash(&sha256, Z);
    addECPHash(&sha256, A);
    addECPHash(&sha256, B);
    addECPHash(&sha256, AR);
    addECPHash(&sha256, BR);

    char hh[32];
    HASH256_hash(&sha256, hh);
    BIG_fromBytesLen(c, hh, 32);
    BIG order;
    BIG_rcopy(order, CURVE_Order);
    BIG_mod(c, order);
    BIG_norm(c); // Needed?
}

static void makeECPProofEquals(csprng* RNG, ECP* A, ECP* B, ECP* Y, ECP* Z, BIG x, Byte32 message, BIG c, BIG s)
{
    BIG r, order;
    randomModOrder(r, RNG);
    ECP AR, BR;
    ECP_copy(&AR, A);
    ECP_copy(&BR, B);
    PAIR_G1mul(&AR, r);
    PAIR_G1mul(&BR, r);
    ECPchallengeEquals(message, Y, Z, A, B, &AR, &BR, c);
    BIG_rcopy(order, CURVE_Order);
    BIG_modmul(s, c, x, order);
    BIG_modneg(s, s, order);
    BIG_add(s, s, r);
    BIG_mod(s, order);
}

// POK of X such that Y = G ** X
// verify that T = (G ** R) * (Y ** C), C = H(G, Y, T)
static int verifyECPProof(ECP* G, ECP* Y, Byte32 message, BIG c, BIG s)
{
    ECP GS, YC;
    ECP_copy(&GS, G);
    ECP_copy(&YC, Y);
    PAIR_G1mul(&GS, s);
    PAIR_G1mul(&YC, c);
    ECP_add(&GS, &YC);
    BIG cc;
    ECPchallenge(message, Y, G, &GS, cc);
    return BIG_comp(c, cc) == 0;
}

static int verifyECPProofEquals(ECP* A, ECP* B, ECP* Y, ECP* Z, Byte32 message, BIG c, BIG s)
{
    ECP AS, YC, BS, ZC;
    ECP_copy(&AS, A);
    ECP_copy(&YC, Y);
    ECP_copy(&BS, B);
    ECP_copy(&ZC, Z);
    PAIR_G1mul(&AS, s);
    PAIR_G1mul(&YC, c);
    PAIR_G1mul(&BS, s);
    PAIR_G1mul(&ZC, c);
    ECP_add(&AS, &YC);
    ECP_add(&BS, &ZC);
    BIG cc;
    ECPchallengeEquals(message, Y, Z, A, B, &AS, &BS, cc);
    return BIG_comp(c, cc) == 0;
}

// make POK of X such that Y = G ** X
// output is c, s
static void makeECP2Proof(csprng* RNG, ECP2* G, ECP2* Y, BIG x, BIG c, BIG s)
{
    BIG r, order;
    randomModOrder(r, RNG);
    ECP2 GR;
    ECP2_copy(&GR, G);
    PAIR_G2mul(&GR, r);
    ECP2challenge(Y, G, &GR, c);
    BIG_rcopy(order, CURVE_Order);
    BIG_modmul(s, c, x, order);
    BIG_modneg(s, s, order);
    BIG_add(s, s, r);
    BIG_mod(s, order);
}


// POK of X such that Y = G ** X
// verify that T = (G ** R) * (Y ** C), C = H(G, Y, T)
static int verifyECP2Proof(ECP2* G, ECP2* Y, BIG c, BIG s)
{
    ECP2 GS, YC;
    ECP2_copy(&GS, G);
    ECP2_copy(&YC, Y);
    PAIR_G2mul(&GS, s);
    PAIR_G2mul(&YC, c);
    ECP2_add(&GS, &YC);
    BIG cc;
    ECP2challenge(Y, G, &GS, cc);
    return BIG_comp(c, cc) == 0;
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

int serialize_group_public_key(struct GroupPublicKey* in, octet* out)
{
  return
  serialize_ECP2(&in->X, out) &&
  serialize_ECP2(&in->Y, out) &&
  serialize_BIG(&in->cx, out) &&
  serialize_BIG(&in->sx, out) &&
  serialize_BIG(&in->cy, out) &&
  serialize_BIG(&in->sy, out);
}

int deserialize_group_public_key(octet* in, struct GroupPublicKey* out)
{
  return
  deserialize_ECP2(in, &out->X) &&
  deserialize_ECP2(in, &out->Y) &&
  deserialize_BIG(in, &out->cx) &&
  deserialize_BIG(in, &out->sx) &&
  deserialize_BIG(in, &out->cy) &&
  deserialize_BIG(in, &out->sy) &&
  verifyGroupPublicKey(out); // TODO: should this be done here?
}

int serialize_group_private_key(struct GroupPrivateKey* in, octet* out)
{
  return serialize_group_public_key(&in->pub, out) &&
  serialize_BIG(&in->x, out) &&
  serialize_BIG(&in->y, out);
}
static int _checkPrivateKey(struct GroupPrivateKey* key)
{
  ECP2 X, Y;
  setG2(&X);
  setG2(&Y);
  PAIR_G2mul(&X, key->x);
  PAIR_G2mul(&Y, key->y);
  return ECP2_equals(&X, &key->pub.X) && ECP2_equals(&Y, &key->pub.Y);
}
int deserialize_group_private_key(octet* in, struct GroupPrivateKey* out)
{
  return deserialize_group_public_key(in, &out->pub) &&
  deserialize_BIG(in, &out->x) &&
  deserialize_BIG(in, &out->y) &&
  _checkPrivateKey(out); // TODO: should this be done here?
}

int serialize_join_message(struct JoinMessage* in, octet* out)
{
  return
  serialize_ECP(&in->Q, out) &&
  serialize_BIG(&in->c, out) &&
  serialize_BIG(&in->s, out);
}

int deserialize_join_message(octet* in, struct JoinMessage* out)
{
  return
  deserialize_ECP(in, &out->Q) &&
  deserialize_BIG(in, &out->c) &&
  deserialize_BIG(in, &out->s);
}

int serialize_user_credentials(struct UserCredentials* in, octet* out)
{
  return
  serialize_ECP(&in->A, out) &&
  serialize_ECP(&in->B, out) &&
  serialize_ECP(&in->C, out) &&
  serialize_ECP(&in->D, out);
}

int deserialize_user_credentials(octet* in, struct UserCredentials* out)
{
  return
  deserialize_ECP(in, &out->A) &&
  deserialize_ECP(in, &out->B) &&
  deserialize_ECP(in, &out->C) &&
  deserialize_ECP(in, &out->D);
}

int serialize_join_response(struct JoinResponse* in, octet* out)
{
  return
  serialize_user_credentials(&in->cred, out) &&
  serialize_BIG(&in->c, out) &&
  serialize_BIG(&in->s, out);
}

int deserialize_join_response(octet* in, struct JoinResponse* out)
{
  return
  deserialize_user_credentials(in, &out->cred) &&
  deserialize_BIG(in, &out->c) &&
  deserialize_BIG(in, &out->s);
}

int serialize_user_private_key(struct UserPrivateKey* in, octet* out)
{
  return
  serialize_user_credentials(&in->cred, out) &&
  serialize_BIG(&in->gsk, out);
}

int deserialize_user_private_key(octet* in, struct UserPrivateKey* out)
{
  return
  deserialize_user_credentials(in, &out->cred) &&
  deserialize_BIG(in, &out->gsk);
}

int serialize_signature(struct Signature* in, octet* out)
{
  return
  serialize_ECP(&in->A, out) &&
  serialize_ECP(&in->B, out) &&
  serialize_ECP(&in->C, out) &&
  serialize_ECP(&in->D, out) &&
  serialize_ECP(&in->NYM, out) &&
  serialize_BIG(&in->c, out) &&
  serialize_BIG(&in->s, out);
}

int deserialize_signature(octet* in, struct Signature* out)
{
  return
  deserialize_ECP(in, &out->A) &&
  deserialize_ECP(in, &out->B) &&
  deserialize_ECP(in, &out->C) &&
  deserialize_ECP(in, &out->D) &&
  deserialize_ECP(in, &out->NYM) &&
  deserialize_BIG(in, &out->c) &&
  deserialize_BIG(in, &out->s);
}

int serialize_signature_tag(struct Signature* in, octet* out)
{
  return
  serialize_ECP(&in->NYM, out);
}

// n is a challenge for the user, 32 bytes
void join_client(csprng *RNG, Byte32 n, struct JoinMessage *j, struct UserPrivateKey *priv)
    // BIG gsk, ECP* Q, ECP* T, BIG rr) // output
{
    ECP G;
    setG1(&G);

    ECP_copy(&j->Q, &G);
    randomModOrder(priv->gsk, RNG);
    PAIR_G1mul(&j->Q, priv->gsk);

    // ECP_copy(&priv->Q, &j->Q);

    makeECPProof(RNG, &G, &j->Q, priv->gsk, n, j->c, j->s);
}

int join_server(csprng *RNG, struct GroupPrivateKey *priv, struct JoinMessage *j, Byte32 challenge, struct JoinResponse *resp)
{
    BIG order;
    BIG_rcopy(order, CURVE_Order);

    ECP G;
    setG1(&G);
    int ok = verifyECPProof(&G, &j->Q, challenge, j->c, j->s);
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

        makeECPProofEquals(RNG, &G, Q, B, D, tmp, 0, resp->c, resp->s);
    }
    return ok;
}

int setup(csprng *RNG, struct GroupPrivateKey *priv)
{
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

    makeECP2Proof(RNG, &W, &priv->pub.X, priv->x, priv->pub.cx, priv->pub.sx);
    makeECP2Proof(RNG, &W, &priv->pub.Y, priv->y, priv->pub.cy, priv->pub.sy);

    return 0;
}

int verifyGroupPublicKey(struct GroupPublicKey *pub)
{
    ECP2 W;
    setG2(&W);

    return verifyECP2Proof(&W, &pub->X, pub->cx, pub->sx)
        && verifyECP2Proof(&W, &pub->Y, pub->cy, pub->sy);
}

int join_finish_client(struct GroupPublicKey *pub, struct UserPrivateKey *priv, struct JoinResponse *resp)
{
    ECP G, Q;
    setG1(&G);

    ECP_copy(&Q, &G);
    PAIR_G1mul(&Q, priv->gsk);

    if (!verifyECPProofEquals(&G, &Q, &resp->cred.B, &resp->cred.D, 0, resp->c, resp->s)) {
        return 0;
    }

    if (!verifyAux(&resp->cred.A, &resp->cred.B, &resp->cred.C, &resp->cred.D, &pub->X, &pub->Y)) {
        return 0;
    }

    ECP_copy(&priv->cred.A, &resp->cred.A);
    ECP_copy(&priv->cred.B, &resp->cred.B);
    ECP_copy(&priv->cred.C, &resp->cred.C);
    ECP_copy(&priv->cred.D, &resp->cred.D);

    return 1;
}

// msg and octet len should be 32 bytes!!! Assuming sha256 is performed on original input.
void sign(csprng *RNG, struct UserPrivateKey *priv, Byte32 msg, Byte32 bsn, struct Signature *sig)
{
    ECP_copy(&sig->A, &priv->cred.A);
    ECP_copy(&sig->B, &priv->cred.B);
    ECP_copy(&sig->C, &priv->cred.C);
    ECP_copy(&sig->D, &priv->cred.D);

    // Randomize credentials for signature
    BIG r;
    randomModOrder(r, RNG);
    PAIR_G1mul(&sig->A, r);
    PAIR_G1mul(&sig->B, r);
    PAIR_G1mul(&sig->C, r);
    PAIR_G1mul(&sig->D, r);

    // Map basename to point in G1 (bsn should be 32 bytes and result of crypto hash like sha256)
    ECP BSN;
    mapit(bsn, &BSN);
    ECP_copy(&sig->NYM, &BSN);
    PAIR_G1mul(&sig->NYM, priv->gsk);

    // Compute sha256(msg || bsn) to be used in proof of equality
    Byte32 hh_msg_bsn;
    hash256 h_msg_bsn;
    HASH256_init(&h_msg_bsn);
    for (int i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, msg[i]);
    for (int i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, bsn[i]);
    HASH256_hash(&h_msg_bsn, hh_msg_bsn);
    makeECPProofEquals(RNG, &sig->B, &BSN, &sig->D, &sig->NYM, priv->gsk, hh_msg_bsn, sig->c, sig->s);
}

int verify(char *msg, char *bsn, struct Signature *sig, struct GroupPublicKey *pub)
{
    // Map basename to point in G1 (bsn should be 32 bytes and result of crypto hash like sha256)
    ECP BSN;
    mapit(bsn, &BSN);

    // Compute sha256(msg || bsn) to be used in proof of equality
    char hh_msg_bsn[32];
    hash256 h_msg_bsn;
    HASH256_init(&h_msg_bsn);
    for (int i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, msg[i]);
    for (int i=0; i < 32; ++i) HASH256_process(&h_msg_bsn, bsn[i]);
    HASH256_hash(&h_msg_bsn, hh_msg_bsn);

    return verifyECPProofEquals(&sig->B, &BSN, &sig->D, &sig->NYM, hh_msg_bsn, sig->c, sig->s)
     && !ECP_isinf(&sig->A) && !ECP_isinf(&sig->B)
     && verifyAux(&sig->A, &sig->B, &sig->C, &sig->D, &pub->X, &pub->Y);
}
