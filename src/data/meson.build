# SPDX-FileCopyrightText: Night Theme Switcher Contributors
# SPDX-License-Identifier: GPL-3.0-or-later

gnome.compile_resources(
  'preferences',
  'preferences.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: INSTALL_DIR / 'resources',
)

install_data(
  DNS + '.gschema.xml',
  install_dir: INSTALL_DIR / 'schemas'
)

if not get_option('pack')
  glib_compile_schemas_exe = find_program('glib-compile-schemas')
  custom_target(
    'gschemas',
    build_by_default: true,
    build_always_stale: true,
    output: 'gschemas.compiled',
    command: [
      glib_compile_schemas_exe,
      '--targetdir=@OUTDIR@',
      '@CURRENT_SOURCE_DIR@'
    ],
    install: true,
    install_dir: INSTALL_DIR / 'schemas'
  )
endif
