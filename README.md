# Night Theme Switcher

![](./res/screenshot.png)
<!-- Background picture by Adrien Converse from https://unsplash.com/photos/kCrrUx7US04 -->

Automatically toggle your light and dark GTK and GNOME Shell theme variants, switch backgrounds and launch custom commands at sunset and sunrise.

Supports Night Light, Location Services and manual schedule.

## Theme compatibility

These themes have been tested and work out of the box without any configuration. Other themes might work as well, let me know if there is a specific theme you'd like supported! And you can also manually set your day and night variants.

### GTK themes

- Adapta
- Adwaita (GNOME & Fedora default)
- Arc
- Canta
- Cabinet
- ChromeOS
- Flat-Remix-GTK
- HighContrast
- Kimi
- Layan
- Macwaita
- Matcha (Manjaro default)
- Materia
- Mojave
- Nextwaita
- Orchis
- Plata (Solus default)
- Pop (Pop!_OS default)
- Prof-Gnome-3
- Qogir
- Simply Circles
- Teja
- Vimix
- Yaru (Ubuntu default)

### Shell themes

- Adapta
- Arc
- Canta
- ChromeOS
- Flat-Remix
- Kimi
- Layan
- Matcha (Manjaro default)
- Materia
- Mojave
- Orchis
- Plata (Solus default)
- Pop (Pop!_OS default)
- Qogir
- Simply Circles
- Teja
- Vimix

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

Build and install using `make`:

```bash
make build && make install
```

Restart your GNOME session and enable the extension:

```bash
gnome-extensions enable nightthemeswitcher@romainvigier.fr
```

## Contributing

You're welcome to contribute to the code or the translations! See [CONTRIBUTING.md](./CONTRIBUTING.md).
