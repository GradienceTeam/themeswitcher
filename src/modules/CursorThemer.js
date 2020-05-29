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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;


/**
 * The Cursor Themer is responsible for changing the cursor theme according to
 * the time.
 */
var CursorThemer = class {

	enable() {
		log_debug('Enabling Cursor Themer...');
		this._watch_status();
		this._save_original_theme();
		if ( e.settingsManager.cursor_variants_enabled ) {
			this._connect_settings();
			this._connect_timer();
		}
		log_debug('Cursor Themer enabled.');
	}

	disable() {
		log_debug('Disabling Cursor Themer...');
		this._disconnect_timer();
		this._disconnect_settings();
		this._reset_original_theme();
		this._unwatch_status();
		log_debug('Cursor Themer disabled.');
	}


	_watch_status() {
		log_debug('Watching cursor variants status...');
		this._cursor_variants_status_changed_connect = e.settingsManager.connect('cursor-variants-status-changed', this._on_cursor_variants_status_changed.bind(this));
	}

	_unwatch_status() {
		if ( this._cursor_variants_status_changed_connect ) {
			e.settingsManager.disconnect(this._cursor_variants_status_changed_connect);
			this._cursor_variants_status_changed_connect = null;
		}
		log_debug('Stopped watching cursor variants status.');
	}

	_connect_settings() {
		log_debug('Connecting Cursor Themer to settings...');
		this._cursor_variant_changed_connect = e.settingsManager.connect('cursor-variant-changed', this._on_cursor_variant_changed.bind(this));
		this._cursor_theme_changed_connect = e.settingsManager.connect('cursor-theme-changed', this._on_cursor_theme_changed.bind(this));
	}

	_disconnect_settings() {
		if ( this._cursor_variant_changed_connect ) {
			e.settingsManager.disconnect(this._cursor_variant_changed_connect);
			this._cursor_variant_changed_connect = null;
		}
		if ( this._cursor_theme_changed_connect ) {
			e.settingsManager.disconnect(this._cursor_theme_changed_connect);
			this._cursor_theme_changed_connect = null;
		}
		log_debug('Disconnected Cursor Themer from settings.');
	}

	_connect_timer() {
		log_debug('Connecting Cursor Themer to Timer...');
		this._time_changed_connect = e.timer.connect('time-changed', this._on_time_changed.bind(this));
	}

	_disconnect_timer() {
		if ( this._time_changed_connect ) {
			e.timer.disconnect(this._time_changed_connect);
			this._time_changed_connect = null;
		}
		log_debug('Disconnected Cursor Themer from Timer.');
	}


	_on_cursor_variants_status_changed(settings, enabled) {
		this.disable();
		this.enable();
	}

	_on_cursor_variant_changed(settings, changed_variant_time) {
		if ( changed_variant_time === e.timer.time ) {
			this._set_variant(changed_variant_time);
		}
	}

	_on_cursor_theme_changed(settings, new_theme) {
		switch (e.timer.time) {
			case 'day':
				e.settingsManager.cursor_variant_day = new_theme;
				break;
			case 'night':
				e.settingsManager.cursor_variant_night = new_theme;
		}
		this._set_variant(e.timer.time);
	}

	_on_time_changed(timer, new_time) {
		this._set_variant(new_time);
	}


	_set_variant(time) {
		log_debug(`Setting the cursor ${time} variant...`);
		switch (time) {
			case 'day':
				e.settingsManager.cursor_theme = e.settingsManager.cursor_variant_day;
				break;
			case 'night':
				e.settingsManager.cursor_theme = e.settingsManager.cursor_variant_night;
				break;
			case 'original':
				e.settingsManager.cursor_theme = e.settingsManager.cursor_variant_original;
				break;
		}
	}

	_save_original_theme() {
		e.settingsManager.cursor_variant_original = e.settingsManager.cursor_theme;
	}

	_reset_original_theme() {
		// We don't reset the theme when locking the session to prevent
		// flicker on unlocking
		if ( !main.screenShield.locked ) {
			log_debug('Resetting to the user\'s original cursor theme...');
			this._set_variant('original');
		}
	}

}
