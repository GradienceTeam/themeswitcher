<!--
SPDX-FileCopyrightText: 2021, 2022 Romain Vigier <contact AT romainvigier.fr>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Contributing <!-- omit in toc -->

You're welcome to contribute to the [code](#contributing-to-the-code) or to the [translations](#contributing-to-the-translations)!

---

## Table of contents <!-- omit in toc -->

- [Contributing to the code](#contributing-to-the-code)
	- [Coding style](#coding-style)
	- [Copyright notice](#copyright-notice)
	- [Localized strings](#localized-strings)
- [Contributing to the translations](#contributing-to-the-translations)

---

## Contributing to the code

You'll need [NPM](https://www.npmjs.com/) to install the development dependencies:

```bash
meson compile -C builddir dev
```

When you're done, commit all your changes. Make one commit per change. The commit message must include which part of the code you worked on. Example:

```
Commands Switcher: Change spawned command
```

You can then push to a branch and create a new merge request.

### Coding style

We follow the [GNOME Shell coding style](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/HEAD/HACKING.md) and we use [ESLint](https://eslint.org/) to enforce it.

To make sure your code follows it:

```bash
meson test -C builddir --suite=code
```

### Copyright notice

If you make changes to a file, please put your copyright notice to the top of the file, or in a separate file (named `original-file.ext.license`), following the [SPDX specification](https://spdx.dev/).

We use [`reuse`](https://reuse.software/) to check that all the needed information is present:

```bash
meson test -C builddir --suite=licensing
```

### Creating new files

If you add new source files, you have to add their paths in different files:

- `./src/meson.build` for Javascript files
- `./src/po/POTFILES` for Javascript and UI files

Add them in the correct place alphabetically.

### Localized strings

If you create or modify localized strings, make your changes available for translation:

```bash
meson compile -C builddir nightthemeswitcher@romainvigier.fr-pot
```

## Contributing to the translations

The project uses Weblate to manage translations. Head over [Night Theme Switcher's project page](https://hosted.weblate.org/projects/night-theme-switcher/) to start translating the extension. If you need help, check out [Weblate's user documentation](https://docs.weblate.org/en/latest/user/translating.html).

Current translation status:

[![Translation status](https://hosted.weblate.org/widgets/night-theme-switcher/-/multi-auto.svg)](https://hosted.weblate.org/engage/night-theme-switcher/)
