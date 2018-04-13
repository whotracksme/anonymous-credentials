cmake_minimum_required (VERSION 2.8)
project (groupsign)

add_definitions(-DCMAKE)

enable_testing ()

add_subdirectory(src)

option (ENABLE_TESTS "Enable tests" ON)
if (ENABLE_TESTS)
  add_subdirectory(test)
endif()
