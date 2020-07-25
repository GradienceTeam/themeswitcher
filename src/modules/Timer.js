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
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;
const { TimerNightlight } = Me.imports.modules.TimerNightlight;
const { TimerLocation } = Me.imports.modules.TimerLocation;
const { TimerSchedule } = Me.imports.modules.TimerSchedule;
const { TimerOndemand } = Me.imports.modules.TimerOndemand;


/**
 * The Timer is responsible for signaling any time change to the other modules.
 *
 * They can connect to its 'time-changed' signal and ask its 'time' property
 * for the current time.
 *
 * It will try to use one of this three different time sources, in this order of
 * preference:
 * 	- Night Light
 * 	- Location Services
 * 	- Manual schedule
 *
 * The user can manually force a specific time source and set the manual
 * schedule in the extensions's preferences.
 */
var Timer = class {

	constructor() {
		this._source = null;
		this._previous_time = null;
	}

	enable() {
		log_debug('Enabling Timer...');
		this._connect_settings();
		this._create_source();
		this._connect_source();
		this._enable_source();
		log_debug('Timer enabled.');
	}

	disable() {
		log_debug('Disabling Timer...');
		this._disconnect_source();
		this._disable_source();
		this._disconnect_settings();
		log_debug('Timer disabled.');
	}


	get time() {
		return this._source.time;
	}


	_connect_settings() {
		log_debug('Connecting Timer to settings...');
		this._nightlight_status_changed_connect = e.settingsManager.connect('nightlight-status-changed', this._on_source_changed.bind(this));
		this._location_status_changed_connect = e.settingsManager.connect('location-status-changed', this._on_source_changed.bind(this));
		this._manual_time_source_changed_connect = e.settingsManager.connect('manual-time-source-changed', this._on_source_changed.bind(this));
		this._time_source_changed_connect = e.settingsManager.connect('time-source-changed', this._on_time_source_changed.bind(this));
	}

	_disconnect_settings() {
		if ( this._nightlight_status_changed_connect ) {
			e.settingsManager.disconnect(this._nightlight_status_changed_connect);
			this._nightlight_status_changed_connect = null;
		}
		if ( this._location_status_changed_connect ) {
			e.settingsManager.disconnect(this._location_status_changed_connect);
			this._location_status_changed_connect = null;
		}
		if ( this._manual_time_source_changed_connect ) {
			e.settingsManager.disconnect(this._manual_time_source_changed_connect);
			this._manual_time_source_changed_connect = null;
		}
		if ( this._time_source_changed_connect ) {
			e.settingsManager.disconnect(this._time_source_changed_connect);
			this._time_source_changed_connect = null;
		}
		log_debug('Disconnected Timer from settings.');
	}

	_create_source() {
		switch ( this._get_source() ) {
			case 'nightlight':
				this._source = new TimerNightlight();
				break;
			case 'location':
				this._source = new TimerLocation();
				break;
			case 'schedule':
				this._source = new TimerSchedule();
				break;
			case 'ondemand':
				this._source = new TimerOndemand();
				break;
		}
	}

	_enable_source() {
		this._source.enable();
	}

	_disable_source() {
		if ( this._source ) {
			this._source.disable();
			this._source = null;
		}
	}

	_connect_source() {
		log_debug('Connecting to time source...');
		this._time_changed_connect = this._source.connect('time-changed', this._on_time_changed.bind(this));
	}

	_disconnect_source() {
		if ( this._time_changed_connect ) {
			this._source.disconnect(this._time_changed_connect);
			this._time_changed_connect = null;
		}
		log_debug('Disconnected from time source.');
	}


	_on_source_changed() {
		this.disable();
		this.enable();
	}

	_on_time_source_changed(settings, new_source) {
		if ( e.settingsManager.manual_time_source ) {
			this._on_source_changed();
		}
	}

	_on_time_changed(source, new_time) {
		if ( new_time !== this._previous_time) {
			log_debug(`Time has changed to ${new_time}.`);
			this.emit('time-changed', new_time);
			this._previous_time = new_time;
		}
	}


	_get_source() {
		log_debug('Getting time source...');

		if ( e.settingsManager.manual_time_source ) {
			log_debug(`Time source is forced to ${e.settingsManager.time_source}.`);
			return e.settingsManager.time_source;
		}

		let source;
		if ( e.settingsManager.nightlight_enabled ) {
			source = 'nightlight';
		}
		else if ( e.settingsManager.location_enabled ) {
			source = 'location';
		}
		else {
			source = 'schedule';
		}

		log_debug(`Time source is ${source}.`);
		e.settingsManager.time_source = source;
		return source;
	}

}
Signals.addSignalMethods(Timer.prototype);
