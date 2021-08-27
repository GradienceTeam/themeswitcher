<!--
SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Changelog


## [51] - 2021-08-22

### Added
- Ability to change programmatically the on-demand time (#64)
- Dutch translation by @Vistaus
- Norwegian Bokmål translation by @kingu
- Project is now REUSE-compliant
- New CHANGELOG.md file

### Changed
- Updated preferences window UI:
  - New "Appearance" tab grouping GTK, shell, icon, cursor themes and backgrounds
  - New "Support us" popover
  - Themes dropdowns are now searchable
- Translations are now managed on weblate: https://hosted.weblate.org/projects/night-theme-switcher/
- Releases will now be tagged only by their version number instead of being prefixed by "v"

### Fixed
- Preferences window was not scrollable on small screens (#56)
- Themes dropdown was not scrollable (#61)


## [50] - 2021-04-22

### Added
- Allow icon theme to override on-demand icons


## [49] - 2021-03-29

### Added
- Turkish translation by @tasali


## [48] - 2021-17-03

### Fixed
- Fix GNOME version for EGO


## [47] - 2021-17-03

### Added
- Support for GNOME 40


## [46] - 2021-17-02

### Added
- German translation contributed by @ls-moose

### Fixed
- Don't block the shell when enabled on a incompatible version


## [45] - 2021-05-01

### Fixed
- On-demand panel button not responding to touch event (#42)


## [44] - 2020-12-20

### Added
- Spanish translation by @oscfdezdz


## [43] - 2020-12-08

### Added
- Ability to set dynamic wallpaper as background image (by @whatdoeslunasay)

### Fixed
- Stuck on startup under X session (#41)


## [42] - 2020-12-03

### Fixed
- On-demand timer took precedence over automatic time source (#38)


## [41] - 2020-11-16

### Fixed
- Various bugs


## [40] - 2020-11-06

### Added
- Option to follow Night Light "Disable until tomorrow"
- On-demand option for all automatic sources


## [39] - 2020-09-26

### Added
- Custom icons for on-demand switcher


## [38] - 2020-09-24

### Changed
- Improved preferences window


## [37] - 2020-09-07

### Added
- Compatible with GNOME Shell 3.38

### Fixed
- Various bugs


## [36] - 2020-08-10

### Added
- Support for Adwaita Colors theme
- Support for McOS11-Shell theme
- Support for Mc-OS CTLina theme
- Support for WhiteSur theme
- Support for Yaru Colors theme


## [35] - 2020-07-08

### Added
- Option for on-demand button placement

### Fixed
- Various bugs


## [34] - 2020-08-04

### Fixed
- Various bugs


## [33] - 2020-08-03

### Changed
- Updated preferences UI

### Fixed
- Various bugs


## [32] - 2020-07-29

### Fixed
- Various bugs


## [31] - 2020-06-15

### Added
- Cursor theme switching
- Icon theme switching
- On-demand switch thanks to @goodwillcoding


## [30] - 2020-05-25

### Added
- Include Night Shell Switcher functionality, don't require the User Themes extension any more (but will work with it if it is installed)
- Allow manually setting the time source
- Allow setting custom commands to be launched at time change
- Allow switching background images

### Changed
- Major rewrite of the extension's architecture
- Improve compatibility with older GNOME Shell versions (>=3.28)


## [29] - 2020-05-15

### Fixed
- Various bugs


## [28] - 2020-05-13

### Fixed
- Various bugs


## [27] - 2020-05-09

### Added
- Check if the guessed theme is installed
- Support for manual theme selection


## [26] - 2020-05-06

### Added
- Location Services and manual schedule support


## [25] - 2020-04-20

### Added
- Macwaita theme support
- Nextwaita theme support


## [24] - 2020-04-16

### Added
- Prof-Gnome-3 theme support
- Orchis theme support
- Cabinet theme support
- Simply Circles theme support


## [23] - 2020-04-13

### Changed
- Improved performances

### Fixed
- Variants were reset on session exit (#11)


## [22] - 2020-04-02

### Added
- Support for Plata theme


## [21] - 2020-03-27

### Changed
- Improved performances


## [20] - 2020-03-23

### Fixed
- Theme flicker on screen unlock (#5)


## [19] - 2020-02-27

### Added
- Support for Teja theme
- Support for ChromeOS theme

### Changed
- User experience improvements


## [18] - 2020-02-26

### Changed
- User experience improvements

### Fixed
- Various bugs


## [17] - 2020-02-24

### Added
- GNOME Shell 3.36 compatibility

### Fixed
- Various bugs


## [16] - 2020-02-14

### Changed
- Code refactoring

### Fixed
- Arc variants guessing
- Matcha variants guessing


## [15] - 2020-02-13

### Added
- Adapta theme support
- Canta theme support
- Flat-Remix-GTK theme support
- Layan theme support
- Qogir compatibility


## [14] - 2020-02-13

### Added
- Vimix theme support


## [13] - 2020-02-08

### Changed
- Improved error handling


## [12] - 2020-02-01

### Added
- Mojave theme support

### Fixed
- Theme change not detecting variants


## [11] - 2020-01-27

### Added
- Matcha theme support