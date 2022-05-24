# SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
# SPDX-License-Identifier: GPL-3.0-or-later

configure_file(
  input: 'metadata.json.in',
  output: 'metadata.json',
  configuration: {
    'DNS': DNS,
    'UUID': UUID,
    'VERSION': meson.project_version()
  },
  install_dir: INSTALL_DIR
)

main = [
  'extension.js',
  'prefs.js',
  'utils.js',
]
enums = [
  'enums/Time.js',
]
modules = [
  'modules/Switcher.js',
  'modules/SwitcherCommands.js',
  'modules/SwitcherTheme.js',
  'modules/Timer.js',
  'modules/TimerLocation.js',
  'modules/TimerNightlight.js',
  'modules/TimerOndemand.js',
  'modules/TimerSchedule.js',
]
preferences = [
  'preferences/BackgroundButton.js',
  'preferences/BackgroundsPage.js',
  'preferences/ClearableEntry.js',
  'preferences/CommandsPage.js',
  'preferences/ContributePage.js',
  'preferences/DropDownChoice.js',
  'preferences/SchedulePage.js',
  'preferences/ShortcutButton.js',
  'preferences/ThemesPage.js',
  'preferences/TimeChooser.js',
]

install_data(main, install_dir: INSTALL_DIR)
install_data(enums, install_dir: INSTALL_DIR / 'enums')
install_data(modules, install_dir: INSTALL_DIR / 'modules')
install_data(preferences, install_dir: INSTALL_DIR / 'preferences')

subdir('data')
subdir('po')

if (get_option('pack'))
  zip_exe = find_program('zip')
  meson.add_install_script(
    meson.project_source_root() / 'build-aux' / 'pack.sh',
    zip_exe.full_path(),
    UUID,
    meson.project_source_root() / get_option('packdir')
  )
endif
