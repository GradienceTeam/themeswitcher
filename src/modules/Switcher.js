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
const config = Me.imports.config;

const { log_debug, log_error } = Me.imports.utils;

const { Themer } = Me.imports.modules.Themer;
const { Timer } = Me.imports.modules.Timer;


/*
The Switcher is the orchestrator of the extension.

When the extension is enabled, it asks the Themer to listen to theme changes
from the user and the Timer to listen to changes in the current time:
	- On theme change, it asks the Themer to guess the new day and night
	variants for that theme, and to apply the relevant variant depending on the
	time of the day.
	- On time of the day change, it asks the Themer to apply the relevant
	variant.

When the extension is disabled, it asks the Themer and the Timer to disable
themselves.
*/

var Switcher = class {

	constructor() {
		log_debug('Initializing extension...');
		extensionUtils.initTranslations(Me.metadata.uuid);
		log_debug('Extension initialized.');
	}

	enable() {
		log_debug('Enabling extension...');
		try {
			this.theme = new Themer();
			this.theme.enable();
			this.theme.subscribe(this._on_theme_changed.bind(this));

			this.time = new Timer();
			this.time.enable();
			this.time.subscribe(this._on_time_changed.bind(this));

			log_debug('Extension enabled.');
		}
		catch(e) {
			log_error(e);
		}
	}

	disable() {
		log_debug('Disabling extension...');
		try {
			this.theme.disable();
			this.time.disable();
		}
		catch(e) {} // Since we're disabling, we'll just ignore errors.
		finally {
			this.theme = null;
			this.time = null;
		}
		log_debug('Extension disabled.');
	}

	_on_theme_changed() {
		try {
			this.theme.update_variants();
			this.theme.set_variant(this.time.current);
		}
		catch(e) {
			log_error(e);
		}
	}

	_on_time_changed() {
		try {
			this.theme.set_variant(this.time.current);
		}
		catch(e) {
			log_error(e);
		}
	}

}
