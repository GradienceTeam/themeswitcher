<!--
SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Changelog


## [74] - 2023-02-27

This version adds support for GNOME 44 and removes support for GNOME 43.

### Added

- GNOME 44 support

### Removed

- GNOME 43 support


## [73] - 2023-02-27

### Added

- Bulgarian translation by @smarnv
- Estonian translation by @tenseoverflow
- Swedish translation by @bittin1

### Changed

- Updated Arabic translation by Omar TS
- Updated Dutch translation by @philip.goto
- Updated German translation by @seismist
- Updated Spanish translation by @gallegonovato and @oscfdezdz


## [72] - 2022-12-07

### Changed

- Updated Chinese (Simplified) translation by @poipoipoipoipoipoipoipoipoi
- Updated Chinese (Traditional) translation by Sean Wang
- Updated Occitan translation by @quenty_occitania
- Updated Russian translation by @daudix-UFO


## [71] - 2022-11-07

### Changed

- Updated Czech translation by @wolf-wolf
- Updated Italian translation by @starise
- Updated Japanese translation by citrus flavor

### Fixed

- Schedules with sunrise or sunset on a different day are now supported


## [70] - 2022-10-31

### Added

- A notification is sent when the location is unavailable and the manual schedule is used as a fallback

### Changed

- Updated Dutch translation by @Vistaus
- Updated French translation
- Updated German translation
- Updated Turkish translation by @ersen


## [69] - 2022-10-29

### Fixed

- Shell theme was sometimes not changing with the User Themes extension enabled
- Background thumbnail generation was blocking the preferences dialog
- It was possible to set invalid sunset and sunrise times in the preferences dialog


## [68] - 2022-10-28

### Added

- Hidden setting to manually set the location

### Changed

- Updated Czech translation by Vojtěch Perník
- Updated Italian translation by @phaerrax
- Updated Russian translation by @daudix-UFO


## [67] - 2022-09-19

### Changed

- Updated Arabic translation by Omar TS
- Updated Occitan translation by @quenty_occitania


## [66] - 2022-09-08

This version adds support for GNOME 43 and removes support for GNOME 42.

It no longer uses Night Light as a time source, and will instead use the location, if available, to calculate sunrise and sunset times, and will fallback to a fixed schedule if not.

The Shell now having a quick setting to toggle the dark mode made the on-demand time source superfluous, so it has been removed. The keyboard shortcut is now always available.

Note to packagers: Make sure the build type is not `debug` or the extension will print debug logs.

### Added

- Support for GNOME 43
- Czech translation by @wolf-wolf
- Greek translation by Nikolas Tsilivis
- Japanese translation by citrus flavor

### Changed

- Updated Basque translation by @sergitroll9
- Updated Chinese (Traditional) translation by Sean Wang
- Updated Dutch translation by @philip.goto and @Vistaus
- Updated French translation
- Updated Spanish translation by @oscfdezdz

### Removed

- Support for GNOME 42
- Night Light time source
- On-demand time source (replaced by the built-in dark mode quick setting)
- Transition setting


## [65] - 2022-06-17

### Added

- Build option to pack the extension instead of installing it when running `meson install`
- Chinese (Traditional) translation by @olivertzeng

### Changed

- Updated Dutch translation by @philip.goto
- Updated Hungarian translation by @BathoryPeter
- Updated Russian translation by @AHOHNMYC and @daudix-UFO

### Fixed

- Themes under symbolic links were not displayed in the preferences
- Background button did not accept all supported image formats
- Background button did not interpolate thumbnail


## [64] - 2022-04-27

### Added
- Italian translation by @phaerrax

### Changed
- Updated Arabic translation by Omar TS
- Updated Chinese (Simplified) translation by @wsxy162
- Updated Dutch translation
- Updated French translation
- Updated German translation by @sal0max
- Updated Polish translation
- Updated Portuguese (Brazil) translation
- Updated Russian translation by @daudix-UFO
- Updated Spanish translation by @oscfdezdz
- Updated Turkish translation by @ersen

### Fixed
- Background button was not activated when activating a row
- Background button did not support SVG images


## [63] - 2022-04-13

### Changed
- Updated Polish translation by Przemek Juszczyk

### Fixed
- Empty background buttons in the preferences when the monitor size is unavailable


## [62] - 2022-04-08

### Changed
- Updated Chinese (Simplified) translation by @wsxy162
- Updated Dutch translation by @Vistaus
- Updated French translation
- Updated Norwegian Bokmål translation by @kingu
- Updated Turkish translation by @ersen

### Fixed
- On-demand icon not loaded after extension installation
- Adwaita, Adwaita-dark, HighContrast and HighContrastInverse were added to the list of GTK themes even if they were not present on the system
- Chinese (Simplified) translation was not loaded


## [61] - 2022-04-04

### Changed
- Build system has been replaced by Meson to make packaging easier, see the README for the updated installation instructions
- Updated Arabic translation
- Updated Polish translation by Przemek Juszczyk
- Updated Portuguese (Brazil) translation


## [60] - 2022-03-15

### Added
- Polish translation by Tomasz Dróżdż

### Changed
- Updated Chinese (Simplified) translation by poi
- Updated German translation by eladyn


## [59] - 2022-02-26

### Added
- Initial work on Occitan translation by @quenty_occitania


## [58] - 2022-02-25

### Added
- Allow dropping images on background chooser button
- Keep extension enabled on lock screen

### Changed
- Time source settings grouped under an Advanced section
- Background chooser button follows monitor aspect ratio
- Updated Dutch translation by @Vistaus
- Updated French translation
- Updated Norwegian Bokmål translation by @kingu
- Updated Spanish translation by @oscfdezdz
- Updated Turkish translation by @ersen


## [57] - 2022-02-20

### Fixed
- Transition ran after changing the color scheme


## [56] - 2022-02-20

### Added
- GNOME 42 support
- Use of the new color scheme desktop setting
- Transition between day and night mode
- Chinese (Simplified) translation by poi

### Changed
- Preferences ported to libadwaita
- Backgrounds preferences set the system regular and dark backgrounds
- GTK and Shell themes switching disabled by default
- System menu button follows other entries style
- Updated Dutch translation by @Vistaus
- Updated French translation
- Updated Spanish translation by @oscfdezdz
- Updated Turkish translation by @ersen

### Removed
- GNOME 41 support
- Automatic theme variants detection


## [55] - 2021-11-03

### Added
- Russian translation by Sixella


## [54] - 2021-11-03

### Added
- Fluent themes support
- Initial Romanian translation by Andrei Lazarov


## [53] - 2021-10-08

### Added

- Basque translation by @sergitroll9
- Galician translation by @frandieguez
- Hungarian translation by @urbalazs
- Portuguese (Brazil) translation by @gusta-glitch

### Changed

- Updated Arabic translation by @ots25
- Updated German translation by Kepler 69c
- Updated Spanish translation by @oscfdezdz


## [52] - 2021-08-27

### Added
- GNOME 41 support
- Zorin themes support
- Arabic translation by Omar TS

### Removed
- GNOME 40 support


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
