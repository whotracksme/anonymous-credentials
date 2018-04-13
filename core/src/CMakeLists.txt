message(STATUS "Build libgroupsign")

# This is uses milagro-crypto-c build system functions (amcl_curve_field, etc.)

foreach(curve ${AMCL_CURVE})
  amcl_curve_field(PF "${curve}")
  amcl_curve_field(TC "${curve}")

  if(TARGET amcl_pairing_${TC})
    amcl_configure_file_curve(group-sign_ZZZ.h.in group-sign_${TC}.h "${curve}" group-sign_${TC}_GEN_HDRS)
    amcl_configure_file_curve(group-sign_ZZZ.c.in group-sign_${TC}.c "${curve}" group-sign_${TC}_GEN_SRCS)

    add_library(groupsign_${TC} ${group-sign_${TC}_GEN_SRCS})
    target_link_libraries(groupsign_${TC} PRIVATE amcl_pairing_${TC})
  endif()

endforeach()
