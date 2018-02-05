{
    "targets": [
        {
            "target_name": "addon",
            "sources": [ "addon.c" ],
            'link_settings': {
                'libraries': [
                    '-L<(module_root_dir)/_build/nativebuild/src',
                    '-L<(module_root_dir)/_build/nativebuild/milagro-crypto-c/lib',
                    '-lgroupsign',
                    '-lamcl_core',
                    '-lamcl_curve_BN254',
                    '-lamcl_pairing_BN254',
                    '-Wl,--exclude-libs=ALL'
                ]
            }
        }
    ]
}
