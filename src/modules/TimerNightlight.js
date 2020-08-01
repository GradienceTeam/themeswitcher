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

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;


const COLOR_INTERFACE = `
<node>
    <interface name="org.gnome.SettingsDaemon.Color">
        <property name="NightLightActive" type="b" access="read"/>
    </interface>
</node>`;


/**
 * The Night Light Timer uses Night Light as a time source.
 *
 * It connects to the Color SettingsDaemon DBus proxy to listen to the
 * 'NightLightActive' property and will signal any change.
 */
var TimerNightlight = class {

    constructor() {
        this._colorDbusProxy = null;
        this._nightlightStateConnect = null;
    }

    enable() {
        logDebug('Enabling Night Light Timer...');
        this._connectToColorDbusProxy();
        this._listenToNightlightState();
        this.emit('time-changed', this.time);
        logDebug('Night Light Timer enabled.');
    }

    disable() {
        logDebug('Disabling Night Light Timer...');
        this._stopListeningToNightlightState();
        this._disconnectFromColorDbusProxy();
        logDebug('Night Light Timer disabled.');
    }


    get time() {
        return this._isNightlightActive() ? 'night' : 'day';
    }


    _connectToColorDbusProxy() {
        logDebug('Connecting to Color DBus proxy...');
        const ColorProxy = Gio.DBusProxy.makeProxyWrapper(COLOR_INTERFACE);
        this._colorDbusProxy = new ColorProxy(
            Gio.DBus.session,
            'org.gnome.SettingsDaemon.Color',
            '/org/gnome/SettingsDaemon/Color'
        );
        logDebug('Connected to Color DBus proxy.');
    }

    _disconnectFromColorDbusProxy() {
        logDebug('Disconnecting from Color DBus proxy...');
        this._colorDbusProxy = null;
        logDebug('Disconnected from Color DBus proxy.');
    }

    _listenToNightlightState() {
        logDebug('Listening to Night Light state...');
        this._nightlightStateConnect = this._colorDbusProxy.connect(
            'g-properties-changed',
            this._onNightlightStateChanged.bind(this)
        );
    }

    _stopListeningToNightlightState() {
        this._colorDbusProxy.disconnect(this._nightlightStateConnect);
        logDebug('Stopped listening to Night Light state.');
    }

    _onNightlightStateChanged(_sender, dbusProperties) {
        const properties = dbusProperties.deep_unpack();
        if (properties.NightLightActive) {
            logDebug(`Night Light has become ${properties.NightLightActive.unpack() ? '' : 'in'}active.`);
            this.emit('time-changed', this.time);
        }
    }

    _isNightlightActive() {
        return this._colorDbusProxy.NightLightActive;
    }

};
Signals.addSignalMethods(TimerNightlight.prototype);
