/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2019 Romain Vigier

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

'use strict';

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const EXT_NAME = 'Night Theme Switcher';
const EXT_UUID = 'nightthemeswitcher@romainvigier.fr';

const GSETTINGS_SCHEMA = 'org.gnome.desktop.interface';
const GSETTINGS_PROPERTY = 'gtk-theme';


class Switcher {

	constructor() {
		Gettext.textdomain(EXT_UUID);
		extensionUtils.initTranslations(EXT_UUID);
	}

	enable() {
		this.theme = new Themer();
		this.variants = Variants.guess_from(this.theme.current);
		this.theme.listen(this._on_theme_change.bind(this));

		this.nightlight = new Nightlighter();
		this.nightlight.listen(this._apply_theme_variant.bind(this));

		this._apply_theme_variant();
	}

	disable() {
		try {
			this.theme.current = this.variants.original;
			this.theme.stop_listening();
			this.nightlight.stop_listening();
		}
		catch(e) {
			const message = _('Errors occured while disabling the extension, try removing it.');
			main.notifyError(EXT_NAME, message);
		}
		finally
		{
			this.theme = null;
			this.variants = null;
			this.nightlight = null;
		}
	}

	_apply_theme_variant() {
		this.theme.current = this.nightlight.status ? this.variants.night : this.variants.day;
	}

	_on_theme_change() {
		const new_theme = this.theme.current;
		if ( new_theme === this.variants.day || new_theme === this.variants.night ) return;

		this.variants = this._guess_theme_variants_from();
		this._apply_theme_variant();
	}

}


class Themer {

	constructor() {
		this.gsettings = new Gio.Settings({ schema: GSETTINGS_SCHEMA });
	}

	get current() {
		return this.gsettings.get_string(GSETTINGS_PROPERTY);
	}

	set current(theme) {
		if ( theme === this.current ) return;
		this.gsettings.set_string(GSETTINGS_PROPERTY, theme);
	}

	listen(callback) {
		this.connect = this.gsettings.connect('changed::' + GSETTINGS_PROPERTY, callback);
	}

	stop_listening() {
		if ( this.gsettings && this.connect ){
			this.gsettings.disconnect(this.connect);
		}
	}

}


class Nightlighter {

	constructor() {
		try {
			this._connect_to_dbus();
		}
		catch(e) {
			main.notifyError(EXT_NAME, e);
		}
	}

	get status() {
		try {
			return this.proxy.get_cached_property('NightLightActive').get_boolean();
		}
		catch(e) {
			return false;
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

class Variants {

	static guess_from(name) {
		const variants = {};
		variants.original = name;

		if ( name.includes('HighContrast') ) {
			variants.day = 'HighContrast';
			variants.night = 'HighContrastInverse';
		}
		else if ( name.match(/Materia.*-compact/g) ) {
			variants.day = name.replace(/-dark(?!er)/g, '');
			variants.night = variants.day.replace(/(-light)?-compact/g, '-dark-compact');
		}
		else if ( name.includes('Arc') ) {
			variants.day = name.replace(/-Dark(?!er)/g, '');
			variants.night = variants.day.replace('-Darker', '') + '-Dark';
		}
		else {
			variants.day = name.replace(/-dark(?!er)/g, '');
			variants.night = variants.day.replace(/(-light)?(-darker)?/g, '') + '-dark';
		}

		return variants;
	}

}


function init() {
	return new Switcher();
}
