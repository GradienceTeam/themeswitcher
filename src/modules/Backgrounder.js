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

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;

/**
 * The Backgrounder is responsible for changing the desktop background
 * according to the time.
 *
 * When the user changes its desktop background (for example via the system
 * settings), it will use it as the current time background.
 */
var Backgrounder = class {

    constructor() {
        this._backgroundsStatusChangedConnect = null;
        this._backgroundTimeChangedConnect = null;
        this._backgroundChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Backgrounder...');
        this._watchStatus();
        if (e.settingsManager.backgroundsEnabled) {
            this._connectSettings();
            this._connectTimer();
        }
        logDebug('Backgrounder enabled.');
    }

    disable() {
        logDebug('Disabling Backgrounder...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Backgrounder disabled.');
    }


    _watchStatus() {
        logDebug('Watching backgrounds status...');
        this._backgroundsStatusChangedConnect = e.settingsManager.connect('backgrounds-status-changed', this._onBackgroundsStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._backgroundsStatusChangedConnect) {
            e.settingsManager.disconnect(this._backgroundsStatusChangedConnect);
            this._backgroundsStatusChangedConnect = null;
        }
        logDebug('Stopped watching backgrounds status.');
    }

    _connectSettings() {
        logDebug('Connecting Backgrounder to settings...');
        this._backgroundTimeChangedConnect = e.settingsManager.connect('background-time-changed', this._onBackgroundTimeChanged.bind(this));
        this._backgroundChangedConnect = e.settingsManager.connect('background-changed', this._onBackgroundChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._backgroundTimeChangedConnect) {
            e.settingsManager.disconnect(this._backgroundTimeChangedConnect);
            this._backgroundTimeChangedConnect = null;
        }
        if (this._backgroundChangedConnect) {
            e.settingsManager.disconnect(this._backgroundChangedConnect);
            this._backgroundChangedConnect = null;
        }
        logDebug('Disconnected Backgrounder from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Backgrounder to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Backgrounder from Timer.');
    }


    _onBackgroundsStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onBackgroundTimeChanged(_settings, changedBackgroundTime) {
        if (changedBackgroundTime === e.timer.time)
            this._changeBackground(changedBackgroundTime);
    }

    _onBackgroundChanged(_settings, newBackground) {
        switch (e.timer.time) {
        case 'day':
            e.settingsManager.backgroundDay = newBackground;
            break;
        case 'night':
            e.settingsManager.backgroundNight = newBackground;
        }
    }

    _onTimeChanged(_timer, newTime) {
        this._changeBackground(newTime);
    }


    _changeBackground(time) {
        e.settingsManager.background = time === 'day' ? e.settingsManager.backgroundDay : e.settingsManager.backgroundNight;
    }

};
