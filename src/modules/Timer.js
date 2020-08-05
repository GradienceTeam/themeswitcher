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
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;
const { TimerNightlight } = Me.imports.modules.TimerNightlight;
const { TimerLocation } = Me.imports.modules.TimerLocation;
const { TimerSchedule } = Me.imports.modules.TimerSchedule;
const { TimerOndemand } = Me.imports.modules.TimerOndemand;


/**
 * The Timer is responsible for signaling any time change to the other modules.
 *
 * They can connect to its 'time-changed' signal and ask its 'time' property
 * for the current time.
 *
 * It will try to use one of this three different time sources, in this order of
 * preference:
 *   - Night Light
 *   - Location Services
 *   - Manual schedule
 *
 * The user can manually force a specific time source and set the manual
 * schedule in the extensions's preferences.
 */
var Timer = class {

    constructor() {
        this._source = null;
        this._previousTime = null;
        this._nightlightStatusChangedConnect = null;
        this._locationStatusChangedConnect = null;
        this._manualTimeSourceChangedConnect = null;
        this._timeSourceChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Timer...');
        this._connectSettings();
        this._createSource();
        this._connectSource();
        this._enableSource();
        logDebug('Timer enabled.');
    }

    disable() {
        logDebug('Disabling Timer...');
        this._disconnectSource();
        this._disableSource();
        this._disconnectSettings();
        logDebug('Timer disabled.');
    }


    get time() {
        return this._source ? this._source.time : null;
    }


    _connectSettings() {
        logDebug('Connecting Timer to settings...');
        this._nightlightStatusChangedConnect = e.settingsManager.connect('nightlight-status-changed', this._onSourceChanged.bind(this));
        this._locationStatusChangedConnect = e.settingsManager.connect('location-status-changed', this._onSourceChanged.bind(this));
        this._manualTimeSourceChangedConnect = e.settingsManager.connect('manual-time-source-changed', this._onSourceChanged.bind(this));
        this._timeSourceChangedConnect = e.settingsManager.connect('time-source-changed', this._onTimeSourceChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._nightlightStatusChangedConnect) {
            e.settingsManager.disconnect(this._nightlightStatusChangedConnect);
            this._nightlightStatusChangedConnect = null;
        }
        if (this._locationStatusChangedConnect) {
            e.settingsManager.disconnect(this._locationStatusChangedConnect);
            this._locationStatusChangedConnect = null;
        }
        if (this._manualTimeSourceChangedConnect) {
            e.settingsManager.disconnect(this._manualTimeSourceChangedConnect);
            this._manualTimeSourceChangedConnect = null;
        }
        if (this._timeSourceChangedConnect) {
            e.settingsManager.disconnect(this._timeSourceChangedConnect);
            this._timeSourceChangedConnect = null;
        }
        logDebug('Disconnected Timer from settings.');
    }

    _createSource() {
        switch (this._getSource()) {
        case 'nightlight':
            this._source = new TimerNightlight();
            break;
        case 'location':
            this._source = new TimerLocation();
            break;
        case 'schedule':
            this._source = new TimerSchedule();
            break;
        case 'ondemand':
            this._source = new TimerOndemand();
            break;
        }
    }

    _enableSource() {
        this._source.enable();
    }

    _disableSource() {
        if (this._source) {
            this._source.disable();
            this._source = null;
        }
    }

    _connectSource() {
        logDebug('Connecting to time source...');
        this._timeChangedConnect = this._source.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectSource() {
        if (this._timeChangedConnect) {
            this._source.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected from time source.');
    }


    _onSourceChanged() {
        this.disable();
        this.enable();
    }

    _onTimeSourceChanged(_settings, _newSource) {
        if (e.settingsManager.manualTimeSource)
            this._onSourceChanged();
    }

    _onTimeChanged(_source, newTime) {
        if (newTime !== this._previousTime) {
            logDebug(`Time has changed to ${newTime}.`);
            this.emit('time-changed', newTime);
            this._previousTime = newTime;
        }
    }


    _getSource() {
        logDebug('Getting time source...');

        if (e.settingsManager.manualTimeSource) {
            let source = e.settingsManager.timeSource;
            logDebug(`Time source is forced to ${source}.`);
            if (
                (source === 'nightlight' && !e.settingsManager.nightlightEnabled) ||
                (source === 'location' && !e.settingsManager.locationEnabled)
            ) {
                logDebug(`Unable to choose ${source} time source, falling back to manual schedule.`);
                source = 'schedule';
                e.settingsManager.timeSource = source;
            }
            return source;
        }

        let source;
        if (e.settingsManager.nightlightEnabled)
            source = 'nightlight';
        else if (e.settingsManager.locationEnabled)
            source = 'location';
        else
            source = 'schedule';

        logDebug(`Time source is ${source}.`);
        e.settingsManager.timeSource = source;
        return source;
    }

};
Signals.addSignalMethods(Timer.prototype);
