# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

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

install_subdir('icons', install_dir: INSTALL_DIR)
install_subdir('ui', install_dir: INSTALL_DIR / 'preferences')
