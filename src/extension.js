// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { Gio, GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const { extensionManager } = imports.ui.main;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const { Timer } = Me.imports.modules.Timer;
const { GtkThemer } = Me.imports.modules.GtkThemer;
const { ShellThemer } = Me.imports.modules.ShellThemer;
const { IconThemer } = Me.imports.modules.IconThemer;
const { CursorThemer } = Me.imports.modules.CursorThemer;
const { Commander } = Me.imports.modules.Commander;


var enabled = false;
var timer = null;
var gtkThemer = null;
var shellThemer = null;
var iconThemer = null;
var cursorThemer = null;
var commander = null;


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
    gtkThemer = new GtkThemer();
    shellThemer = new ShellThemer();
    iconThemer = new IconThemer();
    cursorThemer = new CursorThemer();
    commander = new Commander();

    timer.enable();
    gtkThemer.enable();
    shellThemer.enable();
    iconThemer.enable();
    cursorThemer.enable();
    commander.enable();

    enabled = true;
    console.debug('Extension enabled.');
}

/**
 * When the extension is disabled, we disable and remove all the modules.
 */
function disable() {
    console.debug('Disabling extension...');
    enabled = false;

    gtkThemer.disable();
    shellThemer.disable();
    iconThemer.disable();
    cursorThemer.disable();
    commander.disable();
    timer.disable();

    timer = null;
    gtkThemer = null;
    shellThemer = null;
    iconThemer = null;
    cursorThemer = null;
    commander = null;
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
