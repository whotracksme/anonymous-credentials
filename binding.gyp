{
    "targets": [
        {
            "target_name": "groupsign",
            "sources": [ "groupsign_napi.c" ],
            'link_settings': {
                'libraries': [
                    '<(module_root_dir)/_build/nativebuild/group-sign.o',
                    '<(module_root_dir)/_build/nativebuild/core.a',
                    '-Wl,--exclude-libs=ALL'
                ]
            }
        }
    ]
}
