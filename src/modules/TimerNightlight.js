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

const { Gio, GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const { log_debug } = Me.imports.utils;


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

	enable() {
		log_debug('Enabling Night Light Timer...');
		this._connect_to_color_dbus_proxy();
		this._listen_to_nightlight_state();
		this.emit('time-changed', this.time);
		log_debug('Night Light Timer enabled.');
	}

	disable() {
		log_debug('Disabling Night Light Timer...');
		this._stop_listening_to_nightlight_state();
		this._disconnect_from_color_dbus_proxy();
		log_debug('Night Light Timer disabled.');
	}


	get time() {
		return this._is_nightlight_active() ? 'night' : 'day';
	}


	_connect_to_color_dbus_proxy() {
		log_debug('Connecting to Color DBus proxy...');
		const ColorProxy = Gio.DBusProxy.makeProxyWrapper(COLOR_INTERFACE);
		this._color_dbus_proxy = new ColorProxy(
			Gio.DBus.session,
			'org.gnome.SettingsDaemon.Color',
			'/org/gnome/SettingsDaemon/Color'
		);
		log_debug('Connected to Color DBus proxy.');
	}

	_disconnect_from_color_dbus_proxy() {
		log_debug('Disconnecting from Color DBus proxy...');
		this._color_dbus_proxy = null;
		log_debug('Disconnected from Color DBus proxy.');
	}

	_listen_to_nightlight_state() {
		log_debug('Listening to Night Light state...');
		this._nightlight_state_connect = this._color_dbus_proxy.connect(
			'g-properties-changed',
			this._on_nightlight_state_changed.bind(this)
		);
	}

	_stop_listening_to_nightlight_state() {
		this._color_dbus_proxy.disconnect(this._nightlight_state_connect);
		log_debug('Stopped listening to Night Light state.');
	}

	_on_nightlight_state_changed(sender, dbus_properties) {
		const properties = dbus_properties.deep_unpack();
		if ( properties.NightLightActive ) {
			log_debug('Night Light has become ' + (properties.NightLightActive.unpack() ? '' : 'in') + 'active.');
			this.emit('time-changed', this.time);
		}
	}

	_is_nightlight_active() {
		return this._color_dbus_proxy.NightLightActive;
	}

}
Signals.addSignalMethods(TimerNightlight.prototype);
