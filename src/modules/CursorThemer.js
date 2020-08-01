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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;


/**
 * The Cursor Themer is responsible for changing the cursor theme according to
 * the time.
 */
var CursorThemer = class {

    constructor() {
        this._cursorVariantsStatusChangedConnect = null;
        this._cursorVariantChangedConnect = null;
        this._cursorThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Cursor Themer...');
        this._watchStatus();
        this._saveOriginalTheme();
        if (e.settingsManager.cursorVariantsEnabled) {
            this._connectSettings();
            this._connectTimer();
        }
        logDebug('Cursor Themer enabled.');
    }

    disable() {
        logDebug('Disabling Cursor Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._resetOriginalTheme();
        this._unwatchStatus();
        logDebug('Cursor Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching cursor variants status...');
        this._cursorVariantsStatusChangedConnect = e.settingsManager.connect('cursor-variants-status-changed', this._onCursorVariantsStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._cursorVariantsStatusChangedConnect) {
            e.settingsManager.disconnect(this._cursorVariantsStatusChangedConnect);
            this._cursorVariantsStatusChangedConnect = null;
        }
        logDebug('Stopped watching cursor variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Cursor Themer to settings...');
        this._cursorVariantChangedConnect = e.settingsManager.connect('cursor-variant-changed', this._onCursorVariantChanged.bind(this));
        this._cursorThemeChangedConnect = e.settingsManager.connect('cursor-theme-changed', this._onCursorThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._cursorVariantChangedConnect) {
            e.settingsManager.disconnect(this._cursorVariantChangedConnect);
            this._cursorVariantChangedConnect = null;
        }
        if (this._cursorThemeChangedConnect) {
            e.settingsManager.disconnect(this._cursorThemeChangedConnect);
            this._cursorThemeChangedConnect = null;
        }
        logDebug('Disconnected Cursor Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Cursor Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Cursor Themer from Timer.');
    }


    _onCursorVariantsStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onCursorVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setVariant(changedVariantTime);
    }

    _onCursorThemeChanged(_settings, newTheme) {
        switch (e.timer.time) {
        case 'day':
            e.settingsManager.cursorVariantDay = newTheme;
            break;
        case 'night':
            e.settingsManager.cursorVariantNight = newTheme;
        }
        this._setVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setVariant(newTime);
    }


    _setVariant(time) {
        logDebug(`Setting the cursor ${time} variant...`);
        switch (time) {
        case 'day':
            e.settingsManager.cursorTheme = e.settingsManager.cursorVariantDay;
            break;
        case 'night':
            e.settingsManager.cursorTheme = e.settingsManager.cursorVariantNight;
            break;
        case 'original':
            e.settingsManager.cursorTheme = e.settingsManager.cursorVariantOriginal;
            break;
        }
    }

    _saveOriginalTheme() {
        e.settingsManager.cursorVariantOriginal = e.settingsManager.cursorTheme;
    }

    _resetOriginalTheme() {
        // We don't reset the theme when locking the session to prevent
        // flicker on unlocking
        if (!main.screenShield.locked) {
            logDebug('Resetting to the user\'s original cursor theme...');
            this._setVariant('original');
        }
    }

};
