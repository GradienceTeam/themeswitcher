# Night Theme Switcher

![](./screenshot.gif)

Automatically change the GTK theme to dark variant when Night Light activates.

_Do you need to change your GNOME shell theme as well? Try [Night Shell Switcher](https://gitlab.com/rmnvgr/nightshellswitcher-gnome-shell-extension/)!_

## Theme compatibility

Your theme must have a `-dark` variant, e.g. `Adwaita` and `Adwaita-dark`.

These themes have been tested and work:

- Adapta
- Adwaita
- Arc
- Canta
- Flat-Remix-GTK
- HighContrast
- Layan
- Matcha (thank you @Chrysostomus)
- Materia
- Mojave
- Qogir
- Vimix
- Yaru

Let me know if the theme you use works as well, or if it doesn't, I can try to make it work.

## Graphical installation

Visit [the extension page on extensions.gnome.org](https://extensions.gnome.org/extension/2236/night-theme-switcher/) and enable the extension.

## Command line installation

You will need these tools:

- `make`
- `gettext`
- `gnome-extensions` (comes with GNOME Shell >= 3.34)

Clone the repository and enter the directory:

```bash
git clone https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension.git && cd nightthemeswitcher-gnome-shell-extension
```

Install using `make`:

```bash
make install
```

Restart your GNOME session and enable the extension:

```bash
gnome-extensions enable nightthemeswitcher@romainvigier.fr
```

## Contributing

You're welcome to contribute to the code!

Please follow the coding style of each file. If you make changes to a file, please add your copyright notice at the top of the file, in the form `Copyright (C) YEAR Your Name`.

If you add support for a theme, please write a unit test for each of its variants, in the `tests` directory, with the theme name as filename. Unit tests are written for [AVA](https://github.com/avajs/ava) and run with node and npm.

To install the tests dependencies:

```bash
npm install
```

To run the tests:

```bash
make test
```
