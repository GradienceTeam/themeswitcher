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
const { Gio } = imports.gi;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const Gettext = imports.gettext.domain(config.EXT_UUID);
const _ = Gettext.gettext;


/*
The Nightlighter establishes a connection with the session bus to get the
current Night Light status. It can also be asked to listen to status changes.

As Night Light is essential for the extension to work, it continuously checks
if it is enabled and warns the user if that's not the case.
*/

var Nightlighter = class {

	constructor() {
		this.nightlight_gsettings = new Gio.Settings({ schema: config.NIGHTLIGHT_GSETTINGS_SCHEMA });
	}

	enable() {
		// As Night Light must be enabled for the extension to work, we have to monitor any change of that setting.
		this._listen_to_nightlight_status();
		try {
			this._check_nightlight_status();
			this._connect_to_dbus();
			this._listen_to_nightlight_changes();
		}
		catch(e) {
			main.notifyError(config.EXT_NAME, e.message);
		}
	}

	disable() {
		this._stop_listening_to_nightlight_status();
		this._stop_listening_to_nightlight_changes();
		this._disconnect_from_dbus();
	}

	get status() {
		if ( !this.dbus_proxy ) {
			throw new Error();
		}
		try {
			return this.dbus_proxy.get_cached_property('NightLightActive').get_boolean();
		}
		catch(e) {
			return false; // Sometimes when Night Light hasn't changed colors yet it returns an error, we consider it is inactive.
		}
	}

	subscribe(callback) {
		this.nightlight_change_callback = callback;
	}

	emit() {
		if ( this.nightlight_change_callback ) {
			this.nightlight_change_callback();
		}
	}

	_is_nightlight_enabled() {
		return this.nightlight_gsettings.get_boolean(config.NIGHTLIGHT_GSETTINGS_PROPERTY);
	}

	_check_nightlight_status() {
		if ( !this._is_nightlight_enabled() ) {
			const message = _('Night Light must be enabled to use this extension. Please enable it in your system settings.');
			throw new Error(message);
		}
	}

	_listen_to_nightlight_status() {
		if ( !this.nightlight_status_connect ) {
			this.nightlight_status_connect = this.nightlight_gsettings.connect(
				'changed::' + config.NIGHTLIGHT_GSETTINGS_PROPERTY,
				this._on_nightlight_status_change.bind(this)
			);
		}
	}

	_stop_listening_to_nightlight_status() {
		if ( this.nightlight_gsettings && this.nightlight_status_connect ) {
			this.nightlight_gsettings.disconnect(this.nightlight_status_connect);
			this.nightlight_status_connect = null;
		}
	}

	_on_nightlight_status_change() {
		this.enable();
		this.emit();
	}

	_connect_to_dbus() {
		if ( !this.dbus_proxy ) {
			const connection = Gio.bus_get_sync(Gio.BusType.SESSION, null);
			if ( connection === null ) {
				const message = _('Unable to connect to the session bus.');
				throw new Error(message);
			}
			this.dbus_proxy = Gio.DBusProxy.new_sync(
				connection,
				Gio.DBusProxyFlags.GET_INVALIDATED_PROPERTIES,
				null,
				'org.gnome.SettingsDaemon.Color',
				'/org/gnome/SettingsDaemon/Color',
				'org.gnome.SettingsDaemon.Color',
				null
			);
			if ( this.dbus_proxy === null ) {
				const message = _('Unable to create proxy to the session bus.');
				throw new Error(message);
			}
		}
	}

	_disconnect_from_dbus() {
		if ( this.dbus_proxy ) {
			this.dbus_proxy = null;
		}
	}

	_listen_to_nightlight_changes() {
		if ( !this.nightlight_changes_connect ) {
			this.nightlight_changes_connect = this.dbus_proxy.connect(
				'g-properties-changed',
				this._on_nightlight_change.bind(this)
			);
		}
	}

	_stop_listening_to_nightlight_changes() {
		if ( this.dbus_proxy && this.connect ) {
			this.dbus_proxy.disconnect(this.nightlight_changes_connect);
			this.nightlight_changes_connect = null;
		}
	}

	_on_nightlight_change() {
		this.emit();
	}

}
