<!--
SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
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

You'll need `make` and [NPM](https://www.npmjs.com/) to install the development dependencies:

```bash
npm install --save-dev
```

Create a new branch describing what your're working on, for example `feature/{name-of-the-feature}` or `theme/{name-of-the-theme}`.

When you're done, commit all your changes and create a new merge request. Choose the appropriate merge request template.

### Coding style

We follow the [GNOME Shell coding style](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/HACKING.md) and we use [ESLint](https://eslint.org/) to enforce it.

To make sure your code follows it:

```bash
npm run test-lint
```

### Copyright notice

If you make changes to a file, please your copyright notice to the top of the file, or in a separate file (named `original-file.ext.license`), following the [SPDX specification](https://spdx.dev/).

Run [`reuse`](https://reuse.software/) to check that all the needed information is present:

```bash
reuse lint
```

### Localized strings

If you modify localized strings, make your changes available for translation:

```bash
make pot
```

## Contributing to the translations

The project uses Weblate to manage translations. Head over [Night Theme Switcher's project page](https://hosted.weblate.org/projects/night-theme-switcher/) to start translating the extension. If you need help, check out [Weblate's user documentation](https://docs.weblate.org/en/latest/user/translating.html).

Current translation status:

[![Translation status](https://hosted.weblate.org/widgets/night-theme-switcher/-/multi-auto.svg)](https://hosted.weblate.org/engage/night-theme-switcher/)
