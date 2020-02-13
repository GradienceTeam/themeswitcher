# Night Theme Switcher

![](./screenshot.gif)

Automatically change the GTK theme to dark variant when Night Light activates.

_Do you need to change your GNOME shell theme as well? Try [Night Shell Switcher](https://gitlab.com/rmnvgr/nightshellswitcher-gnome-shell-extension/)!_

## Theme compatibility

Your theme must have a `-dark` variant, e.g. `Adwaita` and `Adwaita-dark`.

These themes have been tested and work:

- Adwaita
- Arc
- Canta
- HighContrast
- Matcha (thank you @Chrysostomus)
- Materia
- Mojave
- Vimix
- Yaru

Let me know if the theme you use works as well, or if it doesn't, I can try to make it work.

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
gnome-extensions enable nightthemeswitcher@romainvigier.fr
```
