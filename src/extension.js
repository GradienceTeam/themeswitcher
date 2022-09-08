// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const debug = Me.imports.debug;

const { SwitcherCommands } = Me.imports.modules.SwitcherCommands;
const { SwitcherThemeCursor, SwitcherThemeGtk, SwitcherThemeIcon, SwitcherThemeShell } = Me.imports.modules.SwitcherTheme;
const { Timer } = Me.imports.modules.Timer;


class NightThemeSwitcher {
    #modules = [];

    constructor() {
        debug.message('Initializing extension...');
        extensionUtils.initTranslations();
        debug.message('Extension initialized.');
    }

    enable() {
        debug.message('Enabling extension...');

        const timer = new Timer();
        this.#modules.push(timer);

        [
            SwitcherThemeGtk,
            SwitcherThemeIcon,
            SwitcherThemeShell,
            SwitcherThemeCursor,
            SwitcherCommands,
        ].forEach(SwitcherModule => this.#modules.push(new SwitcherModule({ timer })));

        this.#modules.forEach(module => module.enable());

        debug.message('Extension enabled.');
    }

    disable() {
        // Extension won't be disabled in `unlock-dialog` session mode. This is
        // to enable the color scheme switch while the lock screen is displayed,
        // as the background image and the shell theme are visible in this mode.
        debug.message('Disabling extension...');

        this.#modules.forEach(module => module.disable());
        this.#modules = [];

        debug.message('Extension disabled.');
    }
}

/**
 * Extension initialization.
 */
function init() {
    return new NightThemeSwitcher();
}
