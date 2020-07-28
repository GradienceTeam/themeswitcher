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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug, log_error, get_installed_shell_themes, get_shell_theme_stylesheet, apply_shell_stylesheet } = Me.imports.utils;
const { ShellVariants } = Me.imports.modules.ShellVariants;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;

/**
 * The Shell Themer is responsible for changing the GTK theme according to the
 * time. It will use the User Themes extension to do so if it is enabled.
 *
 * When the user changes its shell theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the shell variants in the extension's preferences.
 */
var ShellThemer = class {

	enable() {
		log_debug('Enabling Shell Themer...');
		try {
			this._watch_status();
			this._save_original_theme();
			if ( e.settingsManager.shell_variants_enabled ) {
				this._update_variants();
				this._connect_settings();
				this._connect_timer();
			}
		}
		catch(e) {
			log_error(e);
		}
		log_debug('Shell Themer enabled.');
	}

	disable() {
		log_debug('Disabling Shell Themer...');
		this._disconnect_timer();
		this._disconnect_settings();
		this._reset_original_theme();
		this._unwatch_status();
		log_debug('Shell Themer disabled.');
	}


	_watch_status() {
		log_debug('Watching shell variants status...');
		this._shell_variants_status_changed_connect = e.settingsManager.connect('shell-variants-status-changed', this._on_shell_variants_status_changed.bind(this));
	}

	_unwatch_status() {
		if ( this._shell_variants_status_changed_connect ) {
			e.settingsManager.disconnect(this._shell_variants_status_changed_connect);
			this._shell_variants_status_changed_connect = null;
		}
		log_debug('Stopped watching shell variants status.');
	}

	_connect_settings() {
		log_debug('Connecting Shell Themer to settings...');
		this._shell_variant_changed_connect = e.settingsManager.connect('shell-variant-changed', this._on_shell_variant_changed.bind(this));
		this._shell_theme_changed_connect = e.settingsManager.connect('shell-theme-changed', this._on_shell_theme_changed.bind(this));
	}

	_disconnect_settings() {
		if ( this._shell_variant_changed_connect ) {
			e.settingsManager.disconnect(this._shell_variant_changed_connect);
			this._shell_variant_changed_connect = null;
		}
		if ( this._shell_theme_changed_connect ) {
			e.settingsManager.disconnect(this._shell_theme_changed_connect);
			this._shell_theme_changed_connect = null;
		}
		log_debug('Disconnected Shell Themer from settings.');
	}

	_connect_timer() {
		log_debug('Connecting Shell Themer to Timer...');
		this._time_changed_connect = e.timer.connect('time-changed', this._on_time_changed.bind(this));
	}

	_disconnect_timer() {
		if ( this._time_changed_connect ) {
			e.timer.disconnect(this._time_changed_connect);
			this._time_changed_connect = null;
		}
		log_debug('Disconnected Shell Themer from Timer.');
	}


	_on_shell_variants_status_changed(settings, enabled) {
		this.disable();
		this.enable();
	}

	_on_shell_variant_changed(settings, changed_variant_time) {
		if ( changed_variant_time === e.timer.time ) {
			this._set_variant(e.timer.time);
		}
	}

	_on_shell_theme_changed(settings, new_theme) {
		try {
			this._update_variants();
			this._set_variant(e.timer.time);
		}
		catch(e) {
			log_error(e);
		}
	}

	_on_time_changed(timer, new_time) {
		this._set_variant(new_time);
	}


	_are_variants_up_to_date() {
		return ( e.settingsManager.shell_theme === e.settingsManager.shell_variant_day || e.settingsManager.shell_theme === e.settingsManager.shell_variant_night );
	}

	_set_variant(time) {
		log_debug(`Setting the shell ${time} variant...`);
		let shell_theme;
		switch (time) {
			case 'day':
				shell_theme = e.settingsManager.shell_variant_day;
				break;
			case 'night':
				shell_theme = e.settingsManager.shell_variant_night;
				break;
			case 'original':
				shell_theme = e.settingsManager.shell_variant_original;
				break;
		}
		if ( e.settingsManager.use_userthemes ) {
			e.settingsManager.shell_theme = shell_theme;
		}
		else {
			const stylesheet = get_shell_theme_stylesheet(shell_theme);
			apply_shell_stylesheet(stylesheet);
		}
	}

	_update_variants() {
		if ( !e.settingsManager.use_userthemes || e.settingsManager.manual_shell_variants || this._are_variants_up_to_date() ) {
			return;
		}

		log_debug('Updating Shell variants...');
		const variants = ShellVariants.guess_from(e.settingsManager.shell_theme);
		const installed_themes = get_installed_shell_themes();

		if ( !installed_themes.has(variants.get('day')) || !installed_themes.has(variants.get('night')) ) {
			e.settingsManager.shell_variant_original = variants.get('original');
			const message = _('Unable to automatically detect the day and night variants for the "%s" GNOME Shell theme. Please manually choose them in the extension\'s preferences.').format(variants.get('original'));
			throw new Error(message);
		}

		e.settingsManager.shell_variant_day = variants.get('day');
		e.settingsManager.shell_variant_night = variants.get('night');
		e.settingsManager.shell_variant_original = variants.get('original');
		log_debug(`New Shell variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
	}

	_save_original_theme() {
		e.settingsManager.shell_variant_original = e.settingsManager.shell_theme;
	}

	_reset_original_theme() {
		// We don't reset the theme when locking the session to prevent
		// flicker on unlocking
		if ( !main.screenShield.locked ) {
			log_debug('Resetting to the user\'s original Shell theme...');
			this._set_variant('original');
		}
	}

}
Signals.addSignalMethods(ShellThemer.prototype);
