// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { Gio, GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const { extensionManager } = imports.ui.main;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { SwitcherCommands } = Me.imports.modules.SwitcherCommands;
const { SwitcherThemeCursor, SwitcherThemeGtk, SwitcherThemeIcon, SwitcherThemeShell } = Me.imports.modules.SwitcherTheme;
const { Timer } = Me.imports.modules.Timer;


var enabled = false;
var timer = null;
var switcherThemeGtk = null;
var switcherThemeShell = null;
var switcherThemeIcon = null;
var switcherThemeCursor = null;
var switcherCommands = null;


/**
 * Extension initialization.
 */
function init() {
    console.debug('Initializing extension...');
    extensionUtils.initTranslations();
    _migrateBackgroundSettings();
    console.debug('Extension initialized.');
}

/**
 * When the extension is enabled, we wait for the Extension Manager to be
 * initialized before starting.
 */
function enable() {
    _waitForExtensionManager().then(() => start());
}

/**
 * When the extension is started, we create and enable all the modules.
 */
function start() {
    console.debug('Enabling extension...');
    timer = new Timer();
    switcherThemeGtk = new SwitcherThemeGtk({ timer });
    switcherThemeIcon = new SwitcherThemeIcon({ timer });
    switcherThemeShell = new SwitcherThemeShell({ timer });
    switcherThemeCursor = new SwitcherThemeCursor({ timer });
    switcherCommands = new SwitcherCommands({ timer });

    timer.enable();
    switcherThemeGtk.enable();
    switcherThemeShell.enable();
    switcherThemeIcon.enable();
    switcherThemeCursor.enable();
    switcherCommands.enable();

    enabled = true;
    console.debug('Extension enabled.');
}

/**
 * When the extension is disabled, we disable and remove all the modules.
 */
function disable() {
    console.debug('Disabling extension...');
    enabled = false;

    switcherThemeGtk.disable();
    switcherThemeShell.disable();
    switcherThemeIcon.disable();
    switcherThemeCursor.disable();
    switcherCommands.disable();
    timer.disable();

    timer = null;
    switcherThemeGtk = null;
    switcherThemeShell = null;
    switcherThemeIcon = null;
    switcherThemeCursor = null;
    switcherCommands = null;
    console.debug('Extension disabled.');
}

/**
 * Wait for the Extension Manager to be initialized. Returns a Promise.
 */
function _waitForExtensionManager() {
    return new Promise(resolve => {
        console.debug('Waiting for Extension Manager initialization...');
        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            while (!extensionManager._initialized)
                continue;
            return false;
        });
        console.debug('Extension Manager initialized.');
        resolve();
    });
}

/**
 * Migrate background settings from the extension to the system.
 */
function _migrateBackgroundSettings() {
    const systemSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
    const extensionSettings = extensionUtils.getSettings(utils.getSettingsSchema('backgrounds'));

    if (extensionSettings.get_string('day')) {
        systemSettings.set_string('picture-uri', extensionSettings.get_string('day'));
        systemSettings.set_string('picture-uri-dark', extensionSettings.get_string('day'));
        extensionSettings.set_string('day', '');
    }

    if (extensionSettings.get_string('night')) {
        systemSettings.set_string('picture-uri-dark', extensionSettings.get_string('night'));
        extensionSettings.set_string('night', '');
    }
}
