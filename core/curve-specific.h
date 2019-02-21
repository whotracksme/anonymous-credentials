// BN254
#ifdef AMCL_CURVE_BN254
#include "pair_BN254.h"
#define HASH_TYPE SHA256
#define MODBYTES MODBYTES_256_56

#if CURVETYPE_BN254!=WEIERSTRASS
#error "CURVETYPE_BN254 must be WEIERSTRASS"
#endif

typedef BIG_256_56 BIG;
typedef ECP2_BN254 ECP2;
typedef ECP_BN254 ECP;
typedef FP12_BN254 FP12;
typedef FP2_BN254 FP2;

#define BIG_toBytes BIG_256_56_toBytes
#define BIG_fromBytes BIG_256_56_fromBytes
#define BIG_rcopy BIG_256_56_rcopy
#define BIG_randomnum BIG_256_56_randomnum
#define CURVE_Gx CURVE_Gx_BN254
#define CURVE_Gy CURVE_Gy_BN254
#define ECP_set ECP_BN254_set
#define ECP_mapit ECP_BN254_mapit
#define ECP_fromOctet ECP_BN254_fromOctet
#define ECP_toOctet ECP_BN254_toOctet
#define BIG_mod BIG_256_56_mod
#define BIG_add BIG_256_56_add
#define BIG_comp BIG_256_56_comp
#define FP_rcopy FP_BN254_rcopy
#define FP12_one FP12_BN254_one
#define FP12_equals FP12_BN254_equals
// #define ECP2_affine ECP2_BN254_affine
// #define ECP_affine ECP_BN254_affine
#define PAIR_ate PAIR_BN254_ate
#define PAIR_normalized_ate PAIR_BN254_normalized_ate
#define PAIR_normalized_triple_ate PAIR_BN254_normalized_triple_ate
// #define PAIR_triple_ate PAIR_BN254_triple_ate
#define ECP2_toOctet ECP2_BN254_toOctet
#define ECP2_fromOctet ECP2_BN254_fromOctet
#define ECP_toOctet ECP_BN254_toOctet
#define ECP_fromOctet ECP_BN254_fromOctet
#define CURVE_Pxa CURVE_Pxa_BN254
#define CURVE_Pxb CURVE_Pxb_BN254
#define CURVE_Pya CURVE_Pya_BN254
#define CURVE_Pyb CURVE_Pyb_BN254
#define ECP2_set ECP2_BN254_set
#define CURVE_Order CURVE_Order_BN254
#define ECP_copy ECP_BN254_copy
#define PAIR_G1mul PAIR_BN254_G1mul
#define ECP_add ECP_BN254_add
#define ECP2_copy ECP2_BN254_copy
#define PAIR_G2mul PAIR_BN254_G2mul
#define ECP2_add ECP2_BN254_add
#define ECP_isinf ECP_BN254_isinf
#define PAIR_fexp PAIR_BN254_fexp
#define ECP2_equals ECP2_BN254_equals
#define BIG_modmul BIG_256_56_modmul
#define BIG_modneg BIG_256_56_modneg
#define ATE_BITS ATE_BITS_BN254
#define GS_BIG "256_56"
#define GS_FIELD "BN254"
#define GS_CURVE "BN254"
#define PAIR_initmp PAIR_BN254_initmp
#define PAIR_another PAIR_BN254_another
#define PAIR_miller PAIR_BN254_miller

#endif

// BLS383
#ifdef AMCL_CURVE_BLS383
// TODO
#endif
