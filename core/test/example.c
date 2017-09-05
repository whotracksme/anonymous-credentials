#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "group-sign.h"
#include "randapi.h"

int main(void)
{
    int i;
    unsigned long ran;
    char raw[100];
    octet RAW= {0,sizeof(raw),raw};
    csprng RNG;                /* Crypto Strong RNG */

    time((time_t *)&ran);

    RAW.len=100;				/* FIXME: fake random seed source */
    RAW.val[0]=ran;
    RAW.val[1]=ran>>8;
    RAW.val[2]=ran>>16;
    RAW.val[3]=ran>>24;
    for (i=0; i<100; i++) RAW.val[i]=i+1;

    CREATE_CSPRNG(&RNG,&RAW);   /* initialise strong RNG */

    // Setup server parameters (public key)
    struct GroupPrivateKey priv;
    setup(&RNG, &priv);

    // Verify server public key (client should do it)
    int res = verifyGroupPublicKey(&priv.pub);
    if (!res) {
        printf("Bad group public key\n");
        return -1;
    }

    struct JoinMessage j;
    struct UserPrivateKey userPriv;
    char message[32];
    join_client(&RNG, message, &j, &userPriv);

    struct JoinResponse resp;
    res = join_server(&RNG, &priv, &j, message, &resp);
    if (!res) {
        printf("Bad join message\n");
        return -1;
    }

    res = join_finish_client(&priv.pub, &userPriv, &resp);
    if (!res) {
        printf("Bad join response\n");
        return -1;
    }

    // Now client has full valid credentials (userPriv) for the group public key (priv.pub)
    // We can anonymously sign as many messages as we want!!

    struct Signature sig;
    // Note that in a real app these should be sha256 outputs, so exactly 32 bytes
    char msg[] = "hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf";
    char bsn[] = "this is a basenamea hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf hola que talf";

    clock_t start=clock();
    res = 1;
    int iterations = 500;
    for (i = 0; i <iterations; ++i) {
        // res &= verify(msg, bsn, &sig, &priv.pub);
        sign(&RNG, &userPriv, msg, bsn, &sig);
    }

    double elapsed=(clock()-start)/(double)CLOCKS_PER_SEC;
    elapsed=1000.0*elapsed/iterations;
    printf(" %8.2lf ms per iteration\n",elapsed);

    res &= verify(msg, bsn, &sig, &priv.pub);
    printf("res %d\n", res);

    ECP_output(&sig.NYM);
    ECP_output(&sig.A);
    ECP_output(&sig.B);
    ECP_output(&sig.C);
    ECP_output(&sig.D);

    // sign: 6.5ms per signature (native), 9ms in Firefox and 10 ms in V8 (node v8.1.4)
    // verify: 19ms per signature (clang -O3 -march=native). Is the compiler optimizing it away?

    KILL_CSPRNG(&RNG);
}
