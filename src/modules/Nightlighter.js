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

const { log_debug } = Me.imports.utils;

const Gettext = imports.gettext.domain(config.EXT_UUID);
const _ = Gettext.gettext;


/*
The Nightlighter establishes a connection with the session bus to get the
current Night Light status. It listens to changes and reports them.

As Night Light is essential for the extension to work, it continuously checks
if it is enabled and warns the user if that's not the case. To not overwhelm
the user with notifications, it only warns once and then only listens to Night
Light changes to reactivate itself automatically.
*/

var Nightlighter = class {

	constructor() {
		log_debug('Initializing Nightlighter...');
		this.first_nightlight_not_enabled_warning = true;
		this.nightlight_gsettings = new Gio.Settings({ schema: config.NIGHTLIGHT_GSETTINGS_SCHEMA });
		log_debug('Nightlighter initialized.');
	}

	enable() {
		log_debug('Enabling NightLighter...');
		try {
			this._listen_to_nightlight_status();
			this._check_nightlight_status();
			this._connect_to_dbus();
			this._listen_to_nightlight_changes();
			this.emit();
			log_debug('Nightlighter enabled.');
		}
		catch(e) {
			if ( e.message ) {
				main.notifyError(config.EXT_NAME, e.message);
			}
		}
	}

	disable() {
		log_debug('Disabling Nightlighter...');
		this._stop_listening_to_nightlight_status();
		this._stop_listening_to_nightlight_changes();
		this._disconnect_from_dbus();
		log_debug('Nightlighter disabled.');
	}

	get time() {
		if ( this.dbus_proxy ) {
			try {
				return this.dbus_proxy.get_cached_property('NightLightActive').get_boolean() ? 'night' : 'day';
			}
			catch(e) {
				return 'day'; // Sometimes when Night Light hasn't changed colors yet it returns an error, we consider it is inactive.
			}
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
			if ( this.first_nightlight_not_enabled_warning ) {
				this.first_nightlight_not_enabled_warning = false;
				const message = _('Night Light must be enabled to use this extension. Please enable it in your system settings.');
				throw new Error(message);
			}
			else {
				throw new Error();
			}
		}
	}

	_listen_to_nightlight_status() {
		if ( !this.nightlight_status_connect ) {
			this.nightlight_status_connect = this.nightlight_gsettings.connect(
				'changed::' + config.NIGHTLIGHT_GSETTINGS_PROPERTY,
				this._on_nightlight_status_change.bind(this)
			);
			log_debug('Listening to Night Light status changes...');
		}
	}

	_stop_listening_to_nightlight_status() {
		if ( this.nightlight_gsettings && this.nightlight_status_connect ) {
			this.nightlight_gsettings.disconnect(this.nightlight_status_connect);
			this.nightlight_status_connect = null;
			log_debug('Stopped listening to Night Light status changes.');
		}
	}

	_on_nightlight_status_change() {
		log_debug('Night Light status has changed.');
		this.enable();
	}

	_connect_to_dbus() {
		if ( !this.dbus_proxy ) {
			log_debug('Connecting to DBus...');
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
			log_debug('Disconnected from DBus.');
		}
	}

	_listen_to_nightlight_changes() {
		if ( !this.nightlight_changes_connect ) {
			this.nightlight_changes_connect = this.dbus_proxy.connect(
				'g-properties-changed',
				this._on_nightlight_change.bind(this)
			);
			log_debug('Listening to Night Light changes...');
		}
	}

	_stop_listening_to_nightlight_changes() {
		if ( this.dbus_proxy && this.nightlight_changes_connect ) {
			this.dbus_proxy.disconnect(this.nightlight_changes_connect);
			this.nightlight_changes_connect = null;
			log_debug('Stopped listening to Night Light changes.');
		}
	}

	_on_nightlight_change() {
		log_debug('Night Light has changed.');
		this.emit();
	}

}
