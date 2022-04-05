# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

project(
  'nightthemeswitcher',
  version: '61',
  license: ['GPL-3.0-or-later', 'CC-BY-SA-4.0'],
  meson_version: '>= 0.56.0'
)

UUID = 'nightthemeswitcher@romainvigier.fr'
DNS = 'org.gnome.shell.extensions.nightthemeswitcher'

INSTALL_DIR = get_option('datadir') / 'gnome-shell' / 'extensions' / UUID

gnome = import('gnome')
i18n = import('i18n')

subdir('src')


reuse_exe = find_program('reuse', required: false)
if reuse_exe.found()
	test(
		'Comply with REUSE spec',
		reuse_exe,
		args: [
			'--root',
			meson.project_source_root(),
			'lint'
		],
		suite: 'licenses',
	)
endif

eslint_exe = find_program(
	'eslint', 'eslint.js',
	required: false,
	dirs: [ meson.project_source_root() / 'node_modules' / 'eslint' / 'bin' ]
)
if eslint_exe.found()
	test(
		'Check JavaScript format',
		eslint_exe,
		args: [ meson.project_source_root() / 'src' ],
		suite: 'code',
	)
endif
