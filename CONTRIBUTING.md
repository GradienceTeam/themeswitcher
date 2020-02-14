# Contributing

You're welcome to contribute to the code!

## Coding style

Please follow the coding style of each file.

## Copyright notice

If you make changes to a file, please add your copyright notice at the top of the file, in the form `Copyright (C) YEAR Your Name`.

## Themes and unit tests

If you add support for a theme, please write a unit test for each of its variants, in the `tests` directory, with the theme name as filename. Unit tests are written for [AVA](https://github.com/avajs/ava) and run with node and npm.

To install the tests dependencies:

```bash
npm install
```

To run the tests:

```bash
make test
```
