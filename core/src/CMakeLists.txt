link_directories( ${CMAKE_CURRENT_BINARY_DIR}/milagro-crypto-c )
include_directories (${CMAKE_CURRENT_BINARY_DIR}/milagro-crypto-c ${PROJECT_BINARY_DIR}/milagro-crypto-c/include )

set(SOURCES_GROUP_SIGN
  group-sign.c
)

message(STATUS "Build libgroupsign")
add_library(groupsign ${LIB_TYPE} ${SOURCES_GROUP_SIGN})
target_link_libraries (
  groupsign
  amcl_core
  amcl_curve_BN254
  amcl_pairing_BN254
)
