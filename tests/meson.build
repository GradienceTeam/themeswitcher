# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

reuse_exe = find_program('reuse', required: false)
if reuse_exe.found()
  test(
    'reuse',
    reuse_exe,
    args: [
      '--root',
      meson.project_source_root(),
      'lint'
    ],
    suite: 'licensing',
  )
endif

eslint_exe = find_program(
  'eslint', 'eslint.js',
  required: false,
  dirs: [ meson.project_source_root() / 'node_modules' / 'eslint' / 'bin' ]
)
if eslint_exe.found()
  test(
    'eslint',
    eslint_exe,
    args: [ meson.project_source_root() / 'src' ],
    suite: 'code',
  )
endif
