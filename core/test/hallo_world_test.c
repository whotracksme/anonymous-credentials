#include <stdio.h>

#include "group-sign.h"

int main()
{
  printf("Hallo world\n");

  // dummy API calls to see if linking works
  void* pState = GS_createState();
  GS_destroyState(pState);

  return 0;
}
