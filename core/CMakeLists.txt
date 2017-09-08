cmake_minimum_required (VERSION 2.8)
project (groupsign)

add_definitions(-DCMAKE)

# always generate position-independent code
#set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fPIC")
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fPIC")

enable_testing ()

add_subdirectory(src)

option (ENABLE_TESTS "Enable tests" ON)
if (ENABLE_TESTS)
  add_subdirectory(test)
endif()

add_subdirectory(../milagro-crypto-c milagro-crypto-c)
