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
 * The Icon Themer is responsible for changing the icon theme according to the
 * time.
 */
var IconThemer = class {

    constructor() {
        this._iconVariantsStatusChangedConnect = null;
        this._iconVariantChangedConnect = null;
        this._iconThemeChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Icon Themer...');
        this._watchStatus();
        if (e.settingsManager.iconVariantsEnabled) {
            this._connectSettings();
            this._connectTimer();
        }
        logDebug('Icon Themer enabled.');
    }

    disable() {
        logDebug('Disabling Icon Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Icon Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching icon variants status...');
        this._iconVariantsStatusChangedConnect = e.settingsManager.connect('icon-variants-status-changed', this._onIconVariantsStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._iconVariantsStatusChangedConnect) {
            e.settingsManager.disconnect(this._iconVariantsStatusChangedConnect);
            this._iconVariantsStatusChangedConnect = null;
        }
        logDebug('Stopped watching icon variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Icon Themer to settings...');
        this._iconVariantChangedConnect = e.settingsManager.connect('icon-variant-changed', this._onIconVariantChanged.bind(this));
        this._iconThemeChangedConnect = e.settingsManager.connect('icon-theme-changed', this._onIconThemeChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._iconVariantChangedConnect) {
            e.settingsManager.disconnect(this._iconVariantChangedConnect);
            this._iconVariantChangedConnect = null;
        }
        if (this._iconThemeChangedConnect) {
            e.settingsManager.disconnect(this._iconThemeChangedConnect);
            this._iconThemeChangedConnect = null;
        }
        logDebug('Disconnected Icon Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Icon Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Icon Themer from Timer.');
    }


    _onIconVariantsStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onIconVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setVariant(changedVariantTime);
    }

    _onIconThemeChanged(_settings, newTheme) {
        switch (e.timer.time) {
        case 'day':
            e.settingsManager.iconVariantDay = newTheme;
            break;
        case 'night':
            e.settingsManager.iconVariantNight = newTheme;
        }
        this._setVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setVariant(newTime);
    }


    _setVariant(time) {
        logDebug(`Setting the icon ${time} variant...`);
        e.settingsManager.iconTheme = time === 'day' ? e.settingsManager.iconVariantDay : e.settingsManager.iconVariantNight;
    }

};
