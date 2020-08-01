# Contributing

You're welcome to contribute to the [code](#contributing-to-the-code) or to the [translations](#contributing-to-the-translations)!

## Contributing to the code

You'll need `make` and [NPM](https://www.npmjs.com/) to install the development dependencies:

```bash
make deps-install
```

Create a new branch describing what your're working on, for example `feature/{name-of-the-feature}` or `theme/{name-of-the-theme}`.

To make sure your code passes basic checks, run:

```bash
make test
```

When you're done, commit all your changes and create a new merge request. Choose the appropriate merge request template.

### Coding style

We follow the [GNOME Shell coding style](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/HACKING.md) and we use [ESLint](https://eslint.org/) to enforce it.

To make sure your code follows it:

```bash
make test-lint
```

### Copyright notice

If you make changes to a file, please add your copyright notice at the top of the file, in the form `Copyright (C) YEAR Your Name`.

### Themes and unit tests

If you add support for a theme, please write a unit test for each of its variants, in the `tests` directory, with the theme name as filename. Unit tests are written for [AVA](https://github.com/avajs/ava).

To run the tests:

```bash
make test-variants
```

## Contributing to the translations

The extension uses Gettext for its localization. When working on a translation, create a new branch named `translation/{language}`.

### Updating an existing translation

First update all the strings in the source code:

```bash
make pot
```

Then update the translations files:

```bash
make update-po
```

You can then edit the language you want in `src/po/`, either by hand or with a tool like [GNOME Translation Editor](https://wiki.gnome.org/Apps/Gtranslator).

When you're done, commit both the `.pot` file and the `.po` file you've worked on and create a new merge request.

### Adding a new translation

First update all the strings in the source code:

```bash
make pot
```

Then run the following command, replacing `{language-code}` with the [actual code](https://www.loc.gov/standards/iso639-2/php/code_list.php) of the language you want to add:

```bash
make add-po LANGUAGE_CODE={language-code}
```

You can then edit the new `{language-code}.po` file in `src/po/`, either by hand or with a tool like [GNOME Translation Editor](https://wiki.gnome.org/Apps/Gtranslator).

When you're done, commit both the `.pot` file and the `.po` file you've worked on and create a new merge request. Choose the appropriate merge request template.
