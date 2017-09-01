set (CMAKE_CXX_STANDARD 14)

include_directories (
  ../src
  ${CMAKE_CURRENT_BINARY_DIR}/milagro-crypto-c
  ${PROJECT_BINARY_DIR}/milagro-crypto-c/include
)
link_directories (${PROJECT_BINARY_DIR}/src)

add_executable (hallo_world_test hallo_world_test.c)
target_link_libraries(hallo_world_test groupsign)

add_executable (hallo_world_test_cpp hallo_world_test.cpp)
target_link_libraries(hallo_world_test_cpp groupsign)

add_executable (example example.c)
target_link_libraries(example groupsign)
