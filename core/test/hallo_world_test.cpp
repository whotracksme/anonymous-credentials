#include <iostream>
#include <string>

#include "group-sign.h"

int main()
{
    std::cout << "Hallo world\n";

    // dummy API calls to see if linking works
    auto pState = GS_createState();
    GS_destroyState(pState);

    return 0;
}
