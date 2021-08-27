<!--
SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Night Theme Switcher <!-- omit in toc -->

![](./res/screenshot.png)

Automatically toggle your light and dark GTK, GNOME Shell, icon and cursor themes variants, switch backgrounds and run custom commands at sunset and sunrise.

Supports Night Light, Location Services, manual schedule and on-demand switch.

---

## Table of contents <!-- omit in toc -->

- [Theme compatibility](#theme-compatibility)
- [Graphical installation](#graphical-installation)
- [Command line installation](#command-line-installation)
- [Contributing](#contributing)

---

## Theme compatibility

These themes have been tested and work out of the box without any configuration. Other themes might work as well, let me know if there is a specific theme you'd like supported! And you can also manually set your day and night variants.

<details>
<summary>GTK themes</summary>

- Adapta
- Adwaita (GNOME & Fedora default)
- Adwaita Colors
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
- Mc-OS CTLina
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
- WhiteSur
- Yaru (Ubuntu default)
- Yaru Colors
- Zorin

</details>

<details>
<summary>Shell themes</summary>

- Adapta
- Adwaita Colors
- Arc
- Canta
- ChromeOS
- Flat-Remix
- Kimi
- Layan
- Matcha (Manjaro default)
- Materia
- Mc-OS CTLina
- McOS11-Shell
- Mojave
- Orchis
- Plata (Solus default)
- Pop (Pop!_OS default)
- Qogir
- Simply Circles
- Teja
- Vimix
- WhiteSur
- Yaru Colors
- Zorin

</details>

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
