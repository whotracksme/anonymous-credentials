{
    "targets": [
        {
            "target_name": "groupsign",
            "sources": [ "groupsign_napi.c" ],
            'link_settings': {
                'libraries': [
                    '-L<(module_root_dir)/_build/nativebuild/core/src',
                    '-L<(module_root_dir)/_build/nativebuild/milagro-crypto-c/lib',
                    '-lgroupsign_<!(cat <(module_root_dir)/CURVE)',
                    '-lamcl_core',
                    '-lamcl_curve_<!(cat <(module_root_dir)/CURVE)',
                    '-lamcl_pairing_<!(cat <(module_root_dir)/CURVE)',
                    '-Wl,--exclude-libs=ALL'
                ]
            }
        }
    ]
}
