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

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;

/**
 * The Backgrounder is responsible for changing the desktop background
 * according to the time.
 *
 * When the user changes its desktop background (for example via the system
 * settings), it will use it as the current time background.
 */
var Backgrounder = class {

	enable() {
		log_debug('Enabling Backgrounder...');
		this._watch_status();
		if ( e.settingsManager.backgrounds_enabled ) {
			this._change_background(e.timer.time);
			this._connect_settings();
			this._connect_timer();
		}
		log_debug('Backgrounder enabled.');
	}

	disable() {
		log_debug('Disabling Backgrounder...');
		this._disconnect_timer();
		this._disconnect_settings();
		this._unwatch_status();
		log_debug('Backgrounder disabled.');
	}


	_watch_status() {
		log_debug('Watching backgrounds status...');
		this._backgrounds_status_changed_connect = e.settingsManager.connect('backgrounds-status-changed', this._on_backgrounds_status_changed.bind(this));
	}

	_unwatch_status() {
		if ( this._backgrounds_status_changed_connect ) {
			e.settingsManager.disconnect(this._backgrounds_status_changed_connect);
			this._backgrounds_status_changed_connect = null;
		}
		log_debug('Stopped watching backgrounds status.');
	}

	_connect_settings() {
		log_debug('Connecting Backgrounder to settings...');
		this._background_time_changed_connect = e.settingsManager.connect('background-time-changed', this._on_background_time_changed.bind(this));
		this._background_changed_connect = e.settingsManager.connect('background-changed', this._on_background_changed.bind(this));
	}

	_disconnect_settings() {
		if ( this._background_time_changed_connect ) {
			e.settingsManager.disconnect(this._background_time_changed_connect);
			this._background_time_changed_connect = null;
		}
		if ( this._background_changed_connect ) {
			e.settingsManager.disconnect(this._background_changed_connect);
			this._background_changed_connect = null;
		}
		log_debug('Disconnected Backgrounder from settings.');
	}

	_connect_timer() {
		log_debug('Connecting Backgrounder to Timer...');
		this._time_changed_connect = e.timer.connect('time-changed', this._on_time_changed.bind(this));
	}

	_disconnect_timer() {
		if ( this._time_changed_connect ) {
			e.timer.disconnect(this._time_changed_connect);
			this._time_changed_connect = null;
		}
		log_debug('Disconnecting Backgrounder from Timer.');
	}


	_on_backgrounds_status_changed(settings, enabled) {
		this.disable();
		this.enable();
	}

	_on_background_time_changed(settings, changed_background_time) {
		if ( changed_background_time === e.timer.time ) {
			this._change_background(changed_background_time);
		}
	}

	_on_background_changed(settings, new_background) {
		switch (e.timer.time) {
			case 'day':
				e.settingsManager.background_day = new_background;
				break;
			case 'night':
				e.settingsManager.background_night = new_background;
		}
	}

	_on_time_changed(timer, new_time) {
		this._change_background(new_time);
	}


	_change_background(time) {
		e.settingsManager.background = time === 'day' ? e.settingsManager.background_day : e.settingsManager.background_night;
	}

}
