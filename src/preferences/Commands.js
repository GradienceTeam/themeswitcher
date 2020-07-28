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

const { Gio, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const compat = Me.imports.compat;
const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


var CommandsPreferences = class {

	constructor() {
		const settings = compat.get_extension_settings();

		const label = _('Commands');
		const description = _('You can set custom commands that will be run when the time of the day changes.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Use custom commands'), new CommandsEnabledControl()));

		const day_command_row = new SettingsListRow(_('Sunrise'), new SuntimeCommandControl('sunrise'));
		settings.bind(
			'commands-enabled',
			day_command_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(day_command_row);

		const night_command_row = new SettingsListRow(_('Sunset'), new SuntimeCommandControl('sunset'));
		settings.bind(
			'commands-enabled',
			night_command_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(night_command_row);

		return new SettingsPage(label, description, content);
	}

}


class CommandsEnabledControl {

	constructor() {
		const settings = compat.get_extension_settings();
		const toggle = new Gtk.Switch({
			active: settings.get_boolean('commands-enabled')
		});
		settings.bind(
			'commands-enabled',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class SuntimeCommandControl {

	constructor(suntime) {
		const message = new Map([
			['sunrise', _('Hello sunshine!')],
			['sunset', _('Hello moonshine!')]
		]);
		const settings = compat.get_extension_settings();
		const entry = new Gtk.Entry({
			width_request: 300,
			placeholder_text: _(`notify-send "${message.get(suntime)}"`)
		});
		settings.bind(
			`command-${suntime}`,
			entry,
			'text',
			Gio.SettingsBindFlags.DEFAULT
		);
		return entry;
	}

}
