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

const { log_debug } = Me.imports.utils;

const { Nightlighter } = Me.imports.modules.Nightlighter;
const { Themer } = Me.imports.modules.Themer;


/*
The Switcher is the orchestrator of the extension.

When the extension is enabled, it asks the Themer to listen to theme changes
from the user and the Nightlighter to listen to changes in the Night Light
status:
	- On theme change, it asks the Themer to guess the new day and night
	variants for that theme, and to apply the relevant variant depending on the
	Night Light status.
	- On Night Light activation or deactivation, it asks the Themer to apply
	the relevant variant.

When the extension is disabled, it asks the Themer and the Nightlighter to
disable themselves.
*/

var Switcher = class {

	constructor() {
		log_debug('Initializing extension...');
		extensionUtils.initTranslations(config.EXT_UUID);
		log_debug('Extension initialized.');
	}

	enable() {
		log_debug('Enabling extension...');
		try {
			this.theme = new Themer();
			this.theme.enable();
			this.theme.subscribe(this._on_theme_change.bind(this));

			this.nightlight = new Nightlighter();
			this.nightlight.enable();
			this.nightlight.subscribe(this._on_nightlight_change.bind(this));

			this.theme.set_variant(this.nightlight.time);
			log_debug('Extension enabled.');
		}
		catch(e) {
			main.notifyError(config.EXT_NAME, e.message);
		}
	}

	disable() {
		log_debug('Disabling extension...');
		try {
			this.theme.disable();
			this.nightlight.disable();
		}
		catch(e) {} // Since we're disabling, we'll just ignore errors.
		finally {
			this.theme = null;
			this.nightlight = null;
		}
		log_debug('Extension disabled.');
	}

	async _await_extensionManager_init() {
		log_debug('Waiting for the Extension Manager to be initialized...');
		while ( true ) {
			if ( main.extensionManager._initialized ) return;
			await null;
		}
	}

	_on_theme_change() {
		this.theme.update_variants();
		this.theme.set_variant(this.nightlight.time);
	}

	_on_nightlight_change() {
		this.theme.set_variant(this.nightlight.time);
	}

}
