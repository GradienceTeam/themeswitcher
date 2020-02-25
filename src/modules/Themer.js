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


/*
The Themer communicates with the system to get the current theme or set a new
one. It can also be asked to listen to theme changes.
*/

var Themer = class {

	constructor() {
		this.gsettings = new Gio.Settings({ schema: config.THEME_GSETTINGS_SCHEMA });
	}

	enable() {
		return;
	}

	disable() {
		this._stop_listening_to_theme_changes();
	}

	get current() {
		return this.gsettings.get_string(config.THEME_GSETTINGS_PROPERTY);
	}

	set current(theme) {
		if ( theme !== this.current ) {
			this.gsettings.set_string(config.THEME_GSETTINGS_PROPERTY, theme);
		}
	}

	subscribe(callback) {
		this.theme_change_callback = callback;
	}

	_listen_to_theme_changes() {
		if ( !this.connect ) {
			this.connect = this.gsettings.connect('changed::' + config.THEME_GSETTINGS_PROPERTY, this._on_theme_change);
		}
	}

	_stop_listening_to_theme_changes() {
		if ( this.gsettings && this.connect ){
			this.gsettings.disconnect(this.connect);
			this.connect = null;
		}
	}

	_on_theme_change() {
		if ( this.theme_change_callback ) {
			this.theme_change_callback();
		}
	}

}
