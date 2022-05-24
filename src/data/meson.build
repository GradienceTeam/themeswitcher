# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

gnome.compile_resources(
  'preferences',
  'preferences.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: INSTALL_DIR / 'resources',
)

glib_compile_schemas_exe = find_program('glib-compile-schemas')
custom_target(
  'gschemas',
  build_by_default: true,
  output: 'gschemas.compiled',
  command: [
    glib_compile_schemas_exe,
    '--targetdir=@OUTDIR@',
    '@CURRENT_SOURCE_DIR@'
  ],
  install: true,
  install_dir: INSTALL_DIR / 'schemas'
)

icons = [
  'icons/nightthemeswitcher-ondemand-off-symbolic.svg',
  'icons/nightthemeswitcher-ondemand-on-symbolic.svg'
]
install_data(icons, install_dir: INSTALL_DIR / 'icons' / 'hicolor' / 'scalable' / 'status')
