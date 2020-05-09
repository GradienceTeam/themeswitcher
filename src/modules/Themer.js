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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;
const utils = Me.imports.utils;

const { log_debug, log_error } = Me.imports.utils;

const { Variants } = Me.imports.modules.Variants;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


/*
The Themer communicates with the system to get the current theme or set a new
one, and get the day and night variants of a theme. It listens to theme changes
and reports them.
*/

var Themer = class {

	constructor() {
		log_debug('Initializing Themer...');
		this.settings = extensionUtils.getSettings();
		this.theme_gsettings = new Gio.Settings({ schema: config.THEME_GSETTINGS_SCHEMA });
		log_debug('Themer initialized.');
	}

	enable() {
		try {
			log_debug('Enabling Themer...');
			this.ready = false;
			this._listen_to_force_manual_status();
			if ( this._is_force_manual_enabled() ) {
				log_debug('Using manually set variants.');
				this._listen_to_prefs_theme_change();
			}
			else {
				log_debug('Automatically detecting variants.');
				this._listen_to_theme_changes();
				this.update_variants();
			}
			this.ready = true;
			this.emit();
			log_debug('Themer enabled.');
		}
		catch(e) {
			log_error(e);
		}
	}

	disable() {
		log_debug('Disabling Themer...');
		this._stop_listening_to_force_manual_status();
		if ( this._is_force_manual_enabled() ) {
			this._stop_listening_to_prefs_theme_change();
		}
		else {
			this._stop_listening_to_theme_changes();
			// GNOME Shell disables extensions when locking the screen. We'll
			// only reset the theme if the user disables the extension to
			// prevent flickering when unlocking.
			if ( !main.screenShield.locked ) {
				this.reset_theme();
			}
		}
		log_debug('Themer disabled.');
	}

	get current_theme() {
		return this.theme_gsettings.get_string(config.THEME_GSETTINGS_PROPERTY);
	}

	set current_theme(theme) {
		if ( theme !== this.current_theme ) {
			this.theme_gsettings.set_string(config.THEME_GSETTINGS_PROPERTY, theme);
			log_debug(`Theme has been set to "${theme}".`);
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
		if ( this.ready ) {
			log_debug(`Setting theme to the "${variant}" variant...`);
			this.current_theme = this.settings.get_string(`theme-${variant}`);
		}
	}

	reset_theme() {
		this.set_variant('original');
		log_debug('Theme has been reset to the user\'s original variant.')
	}

	update_variants() {
		if ( !this._are_variants_up_to_date() && !this._is_force_manual_enabled() ) {
			this._update_variants();
		}
	}

	_update_variants() {
		if ( this.current_theme ) {
			const variants = Variants.guess_from(this.current_theme);
			if ( utils.is_theme_installed(variants.get('day')) && utils.is_theme_installed(variants.get('night')) ) {
				variants.forEach( (theme, variant) => this.settings.set_string(`theme-${variant}`, theme) );
				log_debug(`Variants updated: {day: "${variants.get('day')}", night: "${variants.get('night')}"}`);
			}
			else {
				const message = _('The extension cannot detect the day and night variants for the "%s" theme. Please choose another theme or manually set variants in the extension preferences.').format(variants.get('original'));
				throw new Error(message);
			}
		}
	}

	_are_variants_up_to_date() {
		return ( this.current_theme === this.settings.get_string('theme-day') || this.current_theme === this.settings.get_string('theme-night') );
	}

	_is_force_manual_enabled() {
		return this.settings.get_boolean('theme-force-manual');
	}

	_listen_to_force_manual_status() {
		if ( !this.force_manual_status_connect ) {
			this.force_manual_status_connect = this.settings.connect(
				'changed::theme-force-manual',
				this._on_force_manual_status_changed.bind(this)
			);
			log_debug('Listening to manual variants status changes...');
		}
	}

	_stop_listening_to_force_manual_status() {
		if ( this.settings && this.force_manual_status_connect ) {
			this.settings.disconnect(this.force_manual_status_connect);
			this.force_manual_status_connect = null;
			log_debug('Stopped listening to manual variants status changes.');
		}
	}

	_on_force_manual_status_changed() {
		log_debug('Manual variants status has changed.');
		this.enable();
	}

	_listen_to_theme_changes() {
		if ( !this.theme_change_connect ) {
			this.theme_change_connect = this.theme_gsettings.connect(
				'changed::' + config.THEME_GSETTINGS_PROPERTY,
				this._on_theme_changed.bind(this)
			);
			log_debug('Listening for theme changes...');
		}
	}

	_stop_listening_to_theme_changes() {
		if ( this.theme_gsettings && this.theme_change_connect ){
			this.theme_gsettings.disconnect(this.theme_change_connect);
			this.theme_change_connect = null;
			log_debug('Stopped listening for theme changes.');
		}
	}

	_on_theme_changed() {
		log_debug(`Theme has changed to "${this.current_theme}".`);
		this.ready ? this.emit() : this.enable();
	}

	_listen_to_prefs_theme_change() {
		if ( !this.prefs_theme_change_connect ) {
			this.prefs_theme_change_connect = new Map();
			['day', 'night'].forEach(time => {
				this.prefs_theme_change_connect.set(time, this.settings.connect(
					`changed::theme-${time}`,
					this._on_theme_changed.bind(this)
				));
				log_debug(`Listening for ${time} theme preference changes...`);
			});
		}
	}

	_stop_listening_to_prefs_theme_change() {
		if ( this.settings && this.prefs_theme_change_connect ) {
			this.prefs_theme_change_connect.forEach(connect => this.settings.disconnect(connect));
			this.prefs_theme_change_connect = null;
			log_debug('Stopped listening to theme preferences changes.');
		}
	}

}
