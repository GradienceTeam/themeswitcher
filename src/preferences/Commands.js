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

const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


var CommandsPreferences = class {

	constructor() {
		const label = _('Commands');
		const description = _('You can set custom commands that will be run when the time of the day changes.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Use custom commands'), new CommandsEnabledControl()));
		content.add_row(new SettingsListRow(_('Sunrise'), new SuntimeCommandControl('sunrise')));
		content.add_row(new SettingsListRow(_('Sunset'), new SuntimeCommandControl('sunset')));

		return new SettingsPage(label, description, content);
	}

}


class CommandsEnabledControl {

	constructor() {
		const settings = extensionUtils.getSettings();
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
		const settings = extensionUtils.getSettings();
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
		settings.bind(
			'commands-enabled',
			entry,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		return entry;
	}

}
