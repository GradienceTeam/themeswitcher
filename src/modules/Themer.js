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

const { log_debug } = Me.imports.utils;

const { Variants } = Me.imports.modules.Variants;


/*
The Themer communicates with the system to get the current theme or set a new
one, and get the day and night variants of a theme. It listens to theme changes
and reports them.
*/

var Themer = class {

	constructor() {
		log_debug('Initializing Themer...');
		this.gsettings = new Gio.Settings({ schema: config.THEME_GSETTINGS_SCHEMA });
		log_debug('Themer initialized.');
	}

	enable() {
		log_debug('Enabling Themer...');
		this._listen_to_theme_changes();
		this._update_variants();
		this.emit();
		log_debug('Themer enabled.');
	}

	disable() {
		log_debug('Disabling Themer...');
		this._stop_listening_to_theme_changes();
		this.reset_theme();
		log_debug('Themer disabled.');
	}

	get current() {
		return this.gsettings.get_string(config.THEME_GSETTINGS_PROPERTY);
	}

	set current(theme) {
		if ( theme !== this.current ) {
			this.gsettings.set_string(config.THEME_GSETTINGS_PROPERTY, theme);
			log_debug(`Theme has been set to "${theme}"`);
		}
	}

	subscribe(callback) {
		this.theme_change_callback = callback;
	}

	emit() {
		if ( this.theme_change_callback ) {
			this.theme_change_callback();
		}
	}

	set_variant(variant) {
		if ( variant && this.variants ) {
			this.current = this.variants.get(variant);
		}
	}

	reset_theme() {
		this.set_variant('original');
		log_debug('Theme has been reset to the user\'s original variant.')
	}

	update_variants() {
		if ( this.variants ) {
			const new_theme = this.current;
			if ( new_theme && new_theme !== this.variants.get('day') && new_theme !== this.variants.get('night') ) {
				this._update_variants();
			}
		}
	}

	_update_variants() {
		if ( this.current ) {
			this.variants = Variants.guess_from(this.current);
			log_debug('Variants updated: ' + this.variants);
		}
	}

	_listen_to_theme_changes() {
		if ( !this.theme_change_connect ) {
			this.theme_change_connect = this.gsettings.connect(
				'changed::' + config.THEME_GSETTINGS_PROPERTY,
				this._on_theme_change.bind(this)
			);
			log_debug('Listening for theme changes...');
		}
	}

	_stop_listening_to_theme_changes() {
		if ( this.gsettings && this.theme_change_connect ){
			this.gsettings.disconnect(this.theme_change_connect);
			this.theme_change_connect = null;
			log_debug('Stopped listening for theme changes.');
		}
	}

	_on_theme_change() {
		log_debug('Theme has changed.');
		this.emit();
	}

}
