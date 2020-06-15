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

const { GLib, Shell, St } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main, panelMenu } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { log_debug } = Me.imports.utils;
const { key_binding_auto_repeat, get_actor } = Me.imports.compat;

/**
 * The On-demand Timer allows the user to manually switch between the day and
 * night variants with a button in the top bar and a keybinding.
 *
 * The user can change the key combination in the extension's preferences.
 */
var TimerOndemand = class {

	constructor() {
		this._button = null;
		this._icon = null;
	}

	enable() {
		log_debug('Enabling On-demand Timer ...');
		this._add_keybinding();
		this._add_button();
		log_debug('On-demand Timer enabled.');
	}

	disable() {
		log_debug('Disabling On-demand Timer ...');
		this._remove_keybinding();
		this._remove_button();
		log_debug('On-demand Timer disabled.');
	}


	get time() {
		return e.settingsManager.ondemand_time;
	}

	_add_keybinding() {
		log_debug('Adding On-demand Timer keybinding...');
		// add our own keydinging handler
		main.wm.addKeybinding(
			'nightthemeswitcher-ondemand-keybinding',
			e.settingsManager._extensionsSettings,
			key_binding_auto_repeat(),
			Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
			this._toggle_time.bind(this)
		);
		log_debug('Added On-demand Timer keybinding.');
	}

	_remove_keybinding() {
		log_debug('Removing On-demand Timer keybinding...');
		main.wm.removeKeybinding('nightthemeswitcher-ondemand-keybinding');
		log_debug('Removed On-demand Timer keybinding.');
	}

	_add_button() {
		log_debug('Adding On-demand Timer button...');

		this._icon = new St.Icon({
			icon_name: this._get_icon_name_for_current_time(),
			style_class: 'system-status-icon'
		});

		this._button = new panelMenu.Button(0.0);
		let button_actor = get_actor(this._button);
		button_actor.add_actor(this._icon);
		this._button.connect(
			'button-press-event',
			this._toggle_time.bind(this)
		);
		main.panel.addToStatusArea('NightThemeSwitcherButton', this._button);

		log_debug('Added On-demand Timer button.');
	}

	_remove_button() {
		log_debug('Removing On-demand Timer button...');
		this._button.destroy();
		log_debug('Removed On-demand Timer button.');
	}

	_toggle_time() {
		e.settingsManager.ondemand_time = e.timer.time === 'day' ? 'night' : 'day';
		this.emit('time-changed', this.time);
		this._icon.icon_name = this._get_icon_name_for_current_time();

	}

	_get_icon_name_for_current_time() {
		return e.timer.time === 'day' ? 'weather-clear-symbolic' : 'weather-clear-night-symbolic';
	}

}
Signals.addSignalMethods(TimerOndemand.prototype);
