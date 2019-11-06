// BN254
#ifdef AMCL_CURVE_BN254
#include "pair_BN254.h"
#define HASH_TYPE HASH_TYPE_BN254
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
#define FP_redc FP_BN254_redc
#define FP_nres FP_BN254_nres
#define FP12_one FP12_BN254_one
#define FP12_equals FP12_BN254_equals
#define PAIR_ate PAIR_BN254_ate
#define PAIR_normalized_ate PAIR_BN254_normalized_ate
#define PAIR_normalized_triple_ate PAIR_BN254_normalized_triple_ate
#define ECP2_toOctet ECP2_BN254_toOctet
#define ECP2_fromOctet ECP2_BN254_fromOctet
#define ECP2_get ECP2_BN254_get
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
#define GS_CURVE "BN254"
#define PAIR_initmp PAIR_BN254_initmp
#define PAIR_another PAIR_BN254_another
#define PAIR_miller PAIR_BN254_miller

#endif

// BLS383
#ifdef AMCL_CURVE_BLS383
#include "pair_BLS383.h"
#define HASH_TYPE HASH_TYPE_BLS383
#define MODBYTES MODBYTES_384_58

#if CURVETYPE_BLS383!=WEIERSTRASS
#error "CURVETYPE_BLS383 must be WEIERSTRASS"
#endif

typedef BIG_384_58 BIG;
typedef ECP2_BLS383 ECP2;
typedef ECP_BLS383 ECP;
typedef FP12_BLS383 FP12;
typedef FP2_BLS383 FP2;

#define BIG_toBytes BIG_384_58_toBytes
#define BIG_fromBytes BIG_384_58_fromBytes
#define BIG_rcopy BIG_384_58_rcopy
#define BIG_randomnum BIG_384_58_randomnum
#define CURVE_Gx CURVE_Gx_BLS383
#define CURVE_Gy CURVE_Gy_BLS383
#define ECP_set ECP_BLS383_set
#define ECP_mapit ECP_BLS383_mapit
#define ECP_fromOctet ECP_BLS383_fromOctet
#define ECP_toOctet ECP_BLS383_toOctet
#define BIG_mod BIG_384_58_mod
#define BIG_add BIG_384_58_add
#define BIG_comp BIG_384_58_comp
#define FP_rcopy FP_BLS383_rcopy
#define FP12_one FP12_BLS383_one
#define FP12_equals FP12_BLS383_equals
#define PAIR_ate PAIR_BLS383_ate
#define PAIR_normalized_ate PAIR_BLS383_normalized_ate
#define PAIR_normalized_triple_ate PAIR_BLS383_normalized_triple_ate
#define ECP2_toOctet ECP2_BLS383_toOctet
#define ECP2_fromOctet ECP2_BLS383_fromOctet
#define ECP_toOctet ECP_BLS383_toOctet
#define ECP_fromOctet ECP_BLS383_fromOctet
#define CURVE_Pxa CURVE_Pxa_BLS383
#define CURVE_Pxb CURVE_Pxb_BLS383
#define CURVE_Pya CURVE_Pya_BLS383
#define CURVE_Pyb CURVE_Pyb_BLS383
#define ECP2_set ECP2_BLS383_set
#define CURVE_Order CURVE_Order_BLS383
#define ECP_copy ECP_BLS383_copy
#define PAIR_G1mul PAIR_BLS383_G1mul
#define ECP_add ECP_BLS383_add
#define ECP2_copy ECP2_BLS383_copy
#define PAIR_G2mul PAIR_BLS383_G2mul
#define ECP2_add ECP2_BLS383_add
#define ECP_isinf ECP_BLS383_isinf
#define PAIR_fexp PAIR_BLS383_fexp
#define ECP2_equals ECP2_BLS383_equals
#define BIG_modmul BIG_384_58_modmul
#define BIG_modneg BIG_384_58_modneg
#define ATE_BITS ATE_BITS_BLS383
#define GS_CURVE "BLS383"
#define PAIR_initmp PAIR_BLS383_initmp
#define PAIR_another PAIR_BLS383_another
#define PAIR_miller PAIR_BLS383_miller
#endif
