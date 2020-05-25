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
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;


/**
 * The Schedule Timer uses a manual schedule to get the current time.
 *
 * Every second, it will check if the time has changed and signal if that's the
 * case.
 *
 * The user can change the schedule in the extension's preferences.
 */
var TimerSchedule = class {

	constructor() {
		this._previously_daytime = null;
	}

	enable() {
		log_debug('Enabling Schedule Timer...');
		this._watch_for_time_change();
		log_debug('Schedule Timer enabled.');
	}

	disable() {
		log_debug('Disabling Schedule Timer...');
		this._stop_watching_for_time_change();
		log_debug('Schedule Timer disabled.');
	}


	get time() {
		return this._is_daytime() ? 'day' : 'night';
	}


	_is_daytime() {
		const time = GLib.DateTime.new_now_local();
		const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
		return ( hour >= e.settingsManager.schedule_sunrise && hour <= e.settingsManager.schedule_sunset );
	}

	_watch_for_time_change() {
		log_debug('Watching for time change...');
		this._time_change_timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
			if ( !Me.imports.extension.enabled ) {
				// The extension doesn't exist anymore, quit the loop
				return false;
			}
			if ( this._previously_daytime !== this._is_daytime() ) {
				this._previously_daytime = this._is_daytime();
				this.emit('time-changed', this.time);
			}
			return true; // Repeat the loop
		});
	}

	_stop_watching_for_time_change() {
		GLib.Source.remove(this._time_change_timer);
		log_debug('Stopped watching for time change.');
	}

}
Signals.addSignalMethods(TimerSchedule.prototype);
