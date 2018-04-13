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

option (SANITIZER_SUPPORT "Sanitizer support" OFF)
if (SANITIZER_SUPPORT)
  if (SANITIZER_SUPPORT STREQUAL "address")
    add_compile_options("-fsanitize=address")
    link_libraries("-fsanitize=address")
  endif()

  if (SANITIZER_SUPPORT STREQUAL "undefined")
    # experiment support:
    add_compile_options("-fsanitize=undefined")
    link_libraries("-fsanitize=undefined")
  endif()
endif()

add_subdirectory(../external/milagro-crypto-c milagro-crypto-c)
