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

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const shellMinorVersion = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]) || parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[0]);


/**
 * Initialize translations for a given gettext domain.
 *
 * @param {string} domain Gettext domain.
 */
function initTranslations(domain) {
    if (shellMinorVersion <= 30)
        return Me.imports.convenience.initTranslations(domain);
    else
        return extensionUtils.initTranslations(domain);
}


/**
 * Get the Extension Manager initialization status.
 *
 * @returns {boolean} `true` if the Extension Manager is initialized, `false`
 * otherwise.
 */
function extensionManagerInitialized() {
    if (shellMinorVersion > 32)
        return imports.ui.main.extensionManager._initialized;
    else
        return imports.ui.extensionSystem.initted;
}


/**
 * Get a specific extension from the Extension Manager.
 *
 * @param {string} uuid UUID of the extension.
 * @returns {(object|null)} The desired extension or `null` if it doesn't exist.
 */
function extensionManagerLookup(uuid) {
    try {
        if (shellMinorVersion > 32)
            return imports.ui.main.extensionManager.lookup(uuid);
        else
            return extensionUtils.extensions[uuid] || null;
    } catch (_) {
        return null;
    }
}


/**
 * Get GSettings for the given schema ID.
 *
 * @param {(string|null)} schema The GSettings schema ID. If not given, will use
 * the extension's schema ID.
 */
function getSettings(schema) {
    if (shellMinorVersion <= 30)
        return Me.imports.convenience.getSettings(schema);
    else
        return extensionUtils.getSettings(schema);
}


/**
 * Get the extension's GSettings.
 */
function getExtensionSettings() {
    return getSettings();
}


/**
 * Get the KeyBinding AutoRepeat flag.
 */
function keyBindingAutoRepeat() {
    // if version is less then 3.30 the keybinding flags are NONE
    if (shellMinorVersion < 30)
        return imports.gi.Meta.KeyBindingFlags.NONE;
    else
        return imports.gi.Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;
}


/**
 * Get the actor from a given subject.
 *
 * @param {object} subject The object to get the actor from.
 */
function getActor(subject) {
    if (shellMinorVersion > 34)
        return subject;
    else
        return subject.actor;
}
