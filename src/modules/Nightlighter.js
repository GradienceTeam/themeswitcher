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

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const Gettext = imports.gettext.domain(config.EXT_UUID);
const _ = Gettext.gettext;


/*
The Nightlighter establishes a connection with the session bus to get the
current Night Light status. It can also be asked to listen to status changes.
*/

var Nightlighter = class {

	constructor() {
		try {
			this._connect_to_dbus();
		}
		catch(e) {
			throw e; // Let's pass the error up.
		}
	}

	get status() {
		try {
			return this.proxy.get_cached_property('NightLightActive').get_boolean();
		}
		catch(e) {
			return false; // If Night Light is disabled, we consider it is inactive.
		}
	}

	listen(callback) {
		this.connect = this.proxy.connect('g-properties-changed', callback);
	}

	stop_listening() {
		if ( this.proxy && this.connect ) {
			this.proxy.disconnect(this.connect);
		}
	}

	_connect_to_dbus() {
		const connection = Gio.bus_get_sync(Gio.BusType.SESSION, null);
		if ( connection === null ) {
			const message = _('Unable to connect to the session bus.');
			throw new Error(message);
		}
		this.proxy = Gio.DBusProxy.new_sync(
			connection,
			Gio.DBusProxyFlags.GET_INVALIDATED_PROPERTIES,
			null,
			'org.gnome.SettingsDaemon.Color',
			'/org/gnome/SettingsDaemon/Color',
			'org.gnome.SettingsDaemon.Color',
			null
		);
		if ( this.proxy === null ) {
			const message = _('Unable to create proxy to the session bus.');
			throw new Error(message);
		}
	}

}
