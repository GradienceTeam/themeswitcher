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
 * The Commander is responsible for spawning commands according to the time.
 */
var Commander = class {

	enable() {
		log_debug('Enabling Commander...');
		this._watch_status();
		if ( e.settingsManager.commands_enabled ) {
			this._connect_timer();
		}
		log_debug('Commander enabled.');
	}

	disable() {
		log_debug('Disabling Commander...');
		this._disconnect_timer();
		this._unwatch_status();
		log_debug('Commander disabled.');
	}


	_watch_status() {
		log_debug('Watching commands status...');
		this._commands_status_changed_connect = e.settingsManager.connect('commands-status-changed', this._on_commands_status_changed.bind(this));
	}

	_unwatch_status() {
		if ( this._commands_status_changed_connect ) {
			e.settingsManager.disconnect(this._commands_status_changed_connect);
			this._commands_status_changed_connect = null;
		}
		log_debug('Stopped watching commands status.');
	}

	_connect_timer() {
		log_debug('Connecting Commander to Timer...');
		this._time_changed_connect = e.timer.connect('time-changed', this._on_time_changed.bind(this));
	}

	_disconnect_timer() {
		if ( this._time_changed_connect ) {
			e.timer.disconnect(this._time_changed_connect);
			this._time_changed_connect = null;
		}
		log_debug('Disconnecting Commander from Timer.');
	}


	_on_commands_status_changed(settings, enabled) {
		this.disable();
		this.enable();
	}

	_on_time_changed(timer, new_time) {
		this._spawn_command(new_time);
	}


	_spawn_command(time) {
		const command = time === 'day' ? e.settingsManager.command_sunrise : e.settingsManager.command_sunset;
		GLib.spawn_async(null, ['sh', '-c', command], null, GLib.SpawnFlags.SEARCH_PATH, null);
		log_debug(`Spawned ${time} command.`);
	}

}
