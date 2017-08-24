cmake_minimum_required (VERSION 2.8)
project (groupsign)

add_definitions(-DCMAKE)

enable_testing ()

add_subdirectory(src)
add_subdirectory(test)

add_subdirectory(../milagro-crypto-c milagro-crypto-c)
