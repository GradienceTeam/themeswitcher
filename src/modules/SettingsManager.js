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

const { log_debug, get_userthemes_extension, get_userthemes_settings } = Me.imports.utils;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


/**
 * The Settings Manager centralizes all the different settings the extension
 * needs. It handles getting and settings values as well as signaling any
 * changes.
 */
var SettingsManager = class {

	constructor() {
		log_debug('Initializing settings...');
		this._extensionsSettings = extensionUtils.getSettings();
		this._colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
		this._locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
		this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
		this._backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
		this._userthemesSettings = get_userthemes_settings();
		log_debug('Settings initialized.');
	}

	enable() {
		log_debug('Connecting settings signals...');
		this._gtk_variant_day_changed_connect = this._extensionsSettings.connect('changed::gtk-variant-day', this._on_gtk_variant_day_changed.bind(this));
		this._gtk_variant_night_changed_connect = this._extensionsSettings.connect('changed::gtk-variant-night', this._on_gtk_variant_night_changed.bind(this));
		this._gtk_variant_original_changed_connect = this._extensionsSettings.connect('changed::gtk-variant-original', this._on_gtk_variant_original_changed.bind(this));
		this._shell_variant_day_changed_connect = this._extensionsSettings.connect('changed::shell-variant-day', this._on_shell_variant_day_changed.bind(this));
		this._shell_variant_night_changed_connect = this._extensionsSettings.connect('changed::shell-variant-night', this._on_shell_variant_night_changed.bind(this));
		this._shell_variant_original_changed_connect = this._extensionsSettings.connect('changed::shell-variant-original', this._on_shell_variant_original_changed.bind(this));
		this._cursor_variants_status_connect = this._extensionsSettings.connect('changed::cursor-variants-enabled', this._on_cursor_variants_status_changed.bind(this));
		this._cursor_variant_day_changed_connect = this._extensionsSettings.connect('changed::cursor-variant-day', this._on_cursor_variant_day_changed.bind(this));
		this._cursor_variant_night_changed_connect = this._extensionsSettings.connect('changed::cursor-variant-night', this._on_cursor_variant_night_changed.bind(this));
		this._cursor_variant_original_changed_connect = this._extensionsSettings.connect('changed::cursor-variant-original', this._on_cursor_variant_original_changed.bind(this));
		this._time_source_changed_connect = this._extensionsSettings.connect('changed::time-source', this._on_time_source_changed.bind(this));
		this._manual_time_source_changed_connect = this._extensionsSettings.connect('changed::manual-time-source', this._on_manual_time_source_changed.bind(this));
		this._commands_status_connect = this._extensionsSettings.connect('changed::commands-enabled', this._on_commands_status_changed.bind(this));
		this._backgrounds_status_connect = this._extensionsSettings.connect('changed::backgrounds-enabled', this._on_backgrounds_status_changed.bind(this));
		this._background_day_changed_connect = this._extensionsSettings.connect('changed::background-day', this._on_background_day_changed.bind(this));
		this._background_night_changed_connect = this._extensionsSettings.connect('changed::background-night', this._on_background_night_changed.bind(this));
		this._nightlight_status_connect = this._colorSettings.connect('changed::night-light-enabled', this._on_nightlight_status_changed.bind(this));
		this._location_status_connect = this._locationSettings.connect('changed::enabled', this._on_location_status_changed.bind(this));
		this._gtk_theme_changed_connect = this._interfaceSettings.connect('changed::gtk-theme', this._on_gtk_theme_changed.bind(this));
		this._cursor_theme_changed_connect = this._interfaceSettings.connect('changed::cursor-theme', this._on_cursor_theme_changed.bind(this));
		this._background_changed_connect = this._backgroundSettings.connect('changed::picture-uri', this._on_background_changed.bind(this));
		if ( this._userthemesSettings ) {
			this._shell_theme_changed_connect = this._userthemesSettings.connect('changed::name', this._on_shell_theme_changed.bind(this));
		}
		log_debug('Settings signals connected.');
	}

	disable() {
		log_debug('Disconnecting settings signals...');
		this._extensionsSettings.disconnect(this._gtk_variant_day_changed_connect);
		this._extensionsSettings.disconnect(this._gtk_variant_night_changed_connect);
		this._extensionsSettings.disconnect(this._gtk_variant_original_changed_connect);
		this._extensionsSettings.disconnect(this._shell_variant_day_changed_connect);
		this._extensionsSettings.disconnect(this._shell_variant_night_changed_connect);
		this._extensionsSettings.disconnect(this._shell_variant_original_changed_connect);
		this._extensionsSettings.disconnect(this._cursor_variants_status_connect);
		this._extensionsSettings.disconnect(this._cursor_variant_day_changed_connect);
		this._extensionsSettings.disconnect(this._cursor_variant_night_changed_connect);
		this._extensionsSettings.disconnect(this._cursor_variant_original_changed_connect);
		this._extensionsSettings.disconnect(this._time_source_changed_connect);
		this._extensionsSettings.disconnect(this._manual_time_source_changed_connect);
		this._extensionsSettings.disconnect(this._commands_status_connect);
		this._extensionsSettings.disconnect(this._backgrounds_status_connect);
		this._extensionsSettings.disconnect(this._background_day_changed_connect);
		this._extensionsSettings.disconnect(this._background_night_changed_connect);
		this._colorSettings.disconnect(this._nightlight_status_connect);
		this._locationSettings.disconnect(this._location_status_connect);
		this._interfaceSettings.disconnect(this._gtk_theme_changed_connect);
		this._interfaceSettings.disconnect(this._cursor_theme_changed_connect);
		this._backgroundSettings.disconnect(this._background_changed_connect);
		if ( this._userthemesSettings ) {
			this._userthemesSettings.disconnect(this._shell_theme_changed_connect);
		}
		log_debug('Settings signals disconnected.');
	}

	/**
	 * SETTERS AND GETTERS
	 */

	/* GTK variants settings */

	get gtk_variant_day() {
		return this._extensionsSettings.get_string('gtk-variant-day');
	}

	set gtk_variant_day(value) {
		if ( value !== this.gtk_variant_day ) {
			this._extensionsSettings.set_string('gtk-variant-day', value);
			log_debug(`The GTK day variant has been set to '${value}'.`);
		}
	}

	get gtk_variant_night() {
		return this._extensionsSettings.get_string('gtk-variant-night');
	}

	set gtk_variant_night(value) {
		if ( value !== this.gtk_variant_night ) {
			this._extensionsSettings.set_string('gtk-variant-night', value);
			log_debug(`The GTK night variant has been set to '${value}'.`);
		}
	}

	get gtk_variant_original() {
		return this._extensionsSettings.get_string('gtk-variant-original');
	}

	set gtk_variant_original(value) {
		if ( value !== this.gtk_variant_original ) {
			this._extensionsSettings.set_string('gtk-variant-original', value);
			log_debug(`The GTK original variant has been set to '${value}'.`);
		}
	}

	get manual_gtk_variants() {
		return this._extensionsSettings.get_boolean('manual-gtk-variants');
	}


	/* Shell variants settings */

	get shell_variant_day() {
		return this._extensionsSettings.get_string('shell-variant-day');
	}

	set shell_variant_day(value) {
		if ( value !== this.shell_variant_day ) {
			this._extensionsSettings.set_string('shell-variant-day', value);
			log_debug(`The shell day variant has been set to '${value}'.`);
		}
	}

	get shell_variant_night() {
		return this._extensionsSettings.get_string('shell-variant-night');
	}

	set shell_variant_night(value) {
		if ( value !== this.shell_variant_night ) {
			this._extensionsSettings.set_string('shell-variant-night', value);
			log_debug(`The shell night variant has been set to '${value}'.`);
		}
	}

	get shell_variant_original() {
		return this._extensionsSettings.get_string('shell-variant-original');
	}

	set shell_variant_original(value) {
		if ( value !== this.shell_variant_original ) {
			this._extensionsSettings.set_string('shell-variant-original', value);
			log_debug(`The shell original variant has been set to '${value}'.`);
		}
	}

	get manual_shell_variants() {
		return this._extensionsSettings.get_boolean('manual-shell-variants');
	}

	/* Cursor variants settings */

	get cursor_variants_enabled() {
		return this._extensionsSettings.get_boolean('cursor-variants-enabled');
	}

	get cursor_variant_day() {
		return this._extensionsSettings.get_string('cursor-variant-day') || this.cursor_theme;
	}

	set cursor_variant_day(value) {
		if ( value !== this.cursor_variant_day ) {
			this._extensionsSettings.set_string('cursor-variant-day', value);
			log_debug(`The cursor day variant has been set to '${value}'.`);
		}
	}

	get cursor_variant_night() {
		return this._extensionsSettings.get_string('cursor-variant-night') || this.cursor_theme;
	}

	set cursor_variant_night(value) {
		if ( value !== this.cursor_variant_night ) {
			this._extensionsSettings.set_string('cursor-variant-night', value);
			log_debug(`The cursor night variant has been set to '${value}'.`);
		}
	}

	get cursor_variant_original() {
		return this._extensionsSettings.get_string('cursor-variant-original');
	}

	set cursor_variant_original(value) {
		if ( value !== this.cursor_variant_original ) {
			this._extensionsSettings.set_string('cursor-variant-original', value);
			log_debug(`The cursor original variant has been set to '${value}'.`);
		}
	}


	/* Time source settings */

	get time_source() {
		return this._extensionsSettings.get_string('time-source');
	}

	get manual_time_source() {
		return this._extensionsSettings.get_boolean('manual-time-source');
	}

	set time_source(value) {
		if ( value !== this.time_source ) {
			this._extensionsSettings.set_string('time-source', value);
			log_debug(`The time source has been set to ${value}.`);
		}
	}

	get schedule_sunrise() {
		return this._extensionsSettings.get_double('schedule-sunrise');
	}

	get schedule_sunset() {
		return this._extensionsSettings.get_double('schedule-sunset');
	}


	/* Commands settings */

	get commands_enabled() {
		return this._extensionsSettings.get_boolean('commands-enabled');
	}

	get command_sunrise() {
		return this._extensionsSettings.get_string('command-sunrise');
	}

	get command_sunset() {
		return this._extensionsSettings.get_string('command-sunset');
	}


	/* Background settings */

	get backgrounds_enabled() {
		return this._extensionsSettings.get_boolean('backgrounds-enabled');
	}

	get background_day() {
		return this._extensionsSettings.get_string('background-day') || this.background;
	}

	set background_day(value) {
		this._extensionsSettings.set_string('background-day', value);
	}

	get background_night() {
		return this._extensionsSettings.get_string('background-night') || this.background;
	}

	set background_night(value) {
		this._extensionsSettings.set_string('background-night', value);
	}


	/* Night Light settings */

	get nightlight_enabled() {
		return this._colorSettings.get_boolean('night-light-enabled');
	}


	/* Location settings */

	get location_enabled() {
		return this._locationSettings.get_boolean('enabled');
	}


	/* GTK theme settings */

	get gtk_theme() {
		return this._interfaceSettings.get_string('gtk-theme');
	}

	set gtk_theme(value) {
		if ( value !== this.gtk_theme ) {
			this._interfaceSettings.set_string('gtk-theme', value);
			log_debug(`GTK theme has been set to '${value}.'`);
		}
	}

	/* Shell theme settings */

	get shell_theme() {
		if ( this._userthemesSettings ) {
			return this._userthemesSettings.get_string('name');
		}
	}

	set shell_theme(value) {
		if ( this._userthemesSettings && value !== this.shell_theme ) {
			this._userthemesSettings.set_string('name', value);
		}
	}

	get use_userthemes() {
		const extension = get_userthemes_extension();
		return (extension && extension.state === 1);
	}


	/* Cursor theme settings */

	get cursor_theme() {
		return this._interfaceSettings.get_string('cursor-theme');
	}

	set cursor_theme(value) {
		if ( value !== this.cursor_theme ) {
			this._interfaceSettings.set_string('cursor-theme', value);
			log_debug(`Cursor theme has been set to '${value}.'`);
		}
	}


	/* Background settings */

	get background() {
		return this._backgroundSettings.get_string('picture-uri');
	}

	set background(value) {
		if ( value !== this.background ) {
			this._backgroundSettings.set_string('picture-uri', value);
		}
	}


	/**
	 * SIGNALS
	 */

	/* GTK variants */

	_on_gtk_variant_day_changed(settings, changed_key) {
		log_debug(`GTK day variant has changed to '${this.gtk_variant_day}'.`);
		this.emit('gtk-variant-changed', 'day');
	}

	_on_gtk_variant_night_changed(settings, changed_key) {
		log_debug(`GTK night variant has changed to '${this.gtk_variant_night}'.`);
		this.emit('gtk-variant-changed', 'night');
	}

	_on_gtk_variant_original_changed(settings, changed_key) {
		log_debug(`GTK original variant has changed to '${this.gtk_variant_original}'.`);
		this.emit('gtk-variant-changed', 'original');
	}


	/* Shell variants */

	_on_shell_variant_day_changed(settings, changed_key) {
		log_debug(`Shell day variant has changed to '${this.shell_variant_day}'.`);
		this.emit('shell-variant-changed', 'day');
	}

	_on_shell_variant_night_changed(settings, changed_key) {
		log_debug(`Shell night variant has changed to '${this.shell_variant_night}'.`);
		this.emit('shell-variant-changed', 'night');
	}

	_on_shell_variant_original_changed(settings, changed_key) {
		log_debug(`Shell original variant has changed to '${this.shell_variant_original}'.`);
		this.emit('shell-variant-changed', 'original');
	}


	/* Cursor variants */

	_on_cursor_variants_status_changed(settings, changed_key) {
		log_debug('Cursor variants have been ' + (this.cursor_variants_enabled ? 'ena' : 'disa') + 'bled.');
		this.emit('cursor-variants-status-changed', this.curso_variants_enabled);
	}

	_on_cursor_variant_day_changed(settings, changed_key) {
		log_debug(`Cursor day variant has changed to '${this.cursor_variant_day}'.`);
		this.emit('cursor-variant-changed', 'day');
	}

	_on_cursor_variant_night_changed(settings, changed_key) {
		log_debug(`Cursor night variant has changed to '${this.cursor_variant_night}'.`);
		this.emit('cursor-variant-changed', 'night');
	}

	_on_cursor_variant_original_changed(settings, changed_key) {
		log_debug(`Cursor original variant has changed to '${this.cursor_variant_original}'.`);
		this.emit('cursor-variant-changed', 'original');
	}


	/* Time source */

	_on_time_source_changed(settings, changed_key) {
		log_debug(`Time source has changed to ${this.time_source}.`);
		this.emit('time-source-changed', this.time_source);
	}

	_on_manual_time_source_changed(settings, changed_key) {
		log_debug('Manual time source has been ' + (this.manual_time_source ? 'ena' : 'disa') + 'bled.');
		this.emit('manual-time-source-changed', this.manual_time_source);
	}


	/* Commands */

	_on_commands_status_changed(settings, changed_key) {
		log_debug('Commands have been ' + (this.commands_enabled ? 'ena' : 'disa') + 'bled.');
		this.emit('commands-status-changed', this.commands_enabled);
	}


	/* Backgrounds */

	_on_backgrounds_status_changed(settings, changed_key) {
		log_debug('Backgrounds have been ' + (this.backgrounds_enabled ? 'ena' : 'disa') + 'bled.');
		this.emit('backgrounds-status-changed', this.backgrounds_enabled);
	}

	_on_background_day_changed(settings, changed_key) {
		log_debug(`Day background has changed to '${this.background_day}'.`);
		this.emit('background-time-changed', 'day');
	}

	_on_background_night_changed(settings, changed_key) {
		log_debug(`Night background has changed to '${this.background_night}'.`);
		this.emit('background-time-changed', 'night');
	}


	/* Night Light */

	_on_nightlight_status_changed(settings, changed_key) {
		log_debug('Night Light has been ' + (this.nightlight_enabled ? 'ena' : 'disa') + 'bled.');
		this.emit('nightlight-status-changed', this.nightlight_enabled);
	}


	/* Location */

	_on_location_status_changed(settings, changed_key) {
		log_debug('Location has been ' + (this.location_enabled ? 'ena' : 'disa') + 'bled.');
		this.emit('location-status-changed', this.location_enabled);
	}


	/* GTK theme */

	_on_gtk_theme_changed(settings, changed_key) {
		log_debug(`GTK theme has changed to '${this.gtk_theme}'.`);
		this.emit('gtk-theme-changed', this.gtk_theme);
	}


	/* Cursor theme */

	_on_cursor_theme_changed(settings, changed_key) {
		log_debug(`Cursor theme has changed to '${this.cursor_theme}'.`);
		this.emit('cursor-theme-changed', this.cursor_theme);
	}


	/* Background */

	_on_background_changed(settings, changed_key) {
		log_debug(`Background has changed to '${this.background}'.`);
		this.emit('background-changed', this.background);
	}


	/* Shell theme */

	_on_shell_theme_changed(settings, changed_key) {
		log_debug(`Shell theme has changed to '${this.shell_theme}'.`);
		this.emit('shell-theme-changed', this.shell_theme);
	}

}
Signals.addSignalMethods(SettingsManager.prototype);
