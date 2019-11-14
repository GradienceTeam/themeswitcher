# Night Theme Switcher

![](./screenshot.gif)

Automatically change the GTK theme to dark variant when Night Light activates.

## Theme compatibility

Your theme must have a `-dark` variant, e.g. `Adwaita` and `Adwaita-dark`.

These themes have been tested and work:

- Adwaita
- Arc
- HighContrast
- Materia
- Yaru

## Graphical installation

Visit [the extension page on extensions.gnome.org](https://extensions.gnome.org/extension/2236/night-theme-switcher/) and enable the extension.

## Command line installation

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
gnome-shell-extension-tool -e nightthemeswitcher@romainvigier.fr
```
