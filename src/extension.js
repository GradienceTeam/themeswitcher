/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2020 Romain Vigier

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http s ://www.gnu.org/licenses/>.
*/

'use strict';

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const compat = Me.imports.compat;
const { logDebug } = Me.imports.utils;
const { Settings } = Me.imports.settings.Settings;
const { Timer } = Me.imports.modules.Timer;
const { GtkThemer } = Me.imports.modules.GtkThemer;
const { ShellThemer } = Me.imports.modules.ShellThemer;
const { IconThemer } = Me.imports.modules.IconThemer;
const { CursorThemer } = Me.imports.modules.CursorThemer;
const { Backgrounder } = Me.imports.modules.Backgrounder;
const { Commander } = Me.imports.modules.Commander;


var enabled = false;
var settings = null;
var timer = null;
var gtkThemer = null;
var shellThemer = null;
var iconThemer = null;
var cursorThemer = null;
var backgrounder = null;
var commander = null;


/**
 * Extension initialization.
 */
function init() {
    logDebug('Initializing extension...');
    compat.initTranslations(Me.metadata['gettext-domain']);
    logDebug('Extension initialized.');
}

/**
 * When the extension is enabled, we wait for the Extension Manager to be
 * initialized before starting.
 */
function enable() {
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => _waitForExtensionManager(start));
}

/**
 * When the extension is started, we create and enable all the modules.
 */
function start() {
    logDebug('Enabling extension...');
    settings = new Settings();
    timer = new Timer();
    gtkThemer = new GtkThemer();
    shellThemer = new ShellThemer();
    iconThemer = new IconThemer();
    cursorThemer = new CursorThemer();
    backgrounder = new Backgrounder();
    commander = new Commander();

    settings.enable();
    gtkThemer.enable();
    shellThemer.enable();
    iconThemer.enable();
    cursorThemer.enable();
    backgrounder.enable();
    commander.enable();
    timer.enable();

    enabled = true;
    logDebug('Extension enabled.');
}

/**
 * When the extension is disabled, we disable and remove all the modules.
 */
function disable() {
    logDebug('Disabling extension...');
    enabled = false;

    gtkThemer.disable();
    shellThemer.disable();
    iconThemer.disable();
    cursorThemer.disable();
    backgrounder.disable();
    commander.disable();
    timer.disable();
    settings.disable();

    settings = null;
    timer = null;
    gtkThemer = null;
    shellThemer = null;
    iconThemer = null;
    cursorThemer = null;
    backgrounder = null;
    commander = null;
    logDebug('Extension disabled.');
}

/**
 * Wait for the Extension Manager to be initialized and run a callback function.
 *
 * @param {Function} callback The function to run when the Extension Manager
 * is initialized.
 */
function _waitForExtensionManager(callback) {
    logDebug('Waiting for Extension Manager initialization...');
    while (!compat.extensionManagerInitialized())
        continue;
    logDebug('Extension Manager initialized.');
    callback();
    return false;
}
