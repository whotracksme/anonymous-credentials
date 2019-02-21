cmake_minimum_required (VERSION 2.8)
project (groupsign)

add_definitions(-DCMAKE)

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

add_subdirectory(external/milagro-crypto-c milagro-crypto-c)

# FIXME: my knowledge of cmake is poor, is there a cleaner way to use the milagro-crypto-c
# cmake to build our library? What is done here is basically copied from their main
# cmake...

list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/external/milagro-crypto-c/cmake)

include(AMCLExpand)
include(CMakeDependentOption)
include(CTest)
include(DetermineWordSize)
include(GNUInstallDirs)
include(SetOSVariable)

### Curves ###
amcl_supported_curves(AMCL_CURVE_NAMES ${WORD_SIZE})
set(AMCL_CURVE "${AMCL_CURVE_NAMES}" CACHE STRING "Choice of Field. See ./include/amcl.h")
set_property(CACHE AMCL_CURVE PROPERTY STRINGS ${AMCL_CURVE_NAMES})
string(REPLACE "," ";" AMCL_CURVE "${AMCL_CURVE}")
log(AMCL_CURVE)
