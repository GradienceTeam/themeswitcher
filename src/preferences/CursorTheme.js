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

const { GdkPixbuf, Gio, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;
const { get_installed_cursor_themes } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


var CursorThemePreferences = class {

	constructor() {
		const settings = extensionUtils.getSettings();

		const label = _('Cursor theme');
		const description = _('You can set different cursor themes for day and night.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Switch cursor variants'), new CursorVariantsEnabledControl()));

		const day_variant_row = new SettingsListRow(_('Day variant'), new TimeCursorVariantControl('day'));
		settings.bind(
			'cursor-variants-enabled',
			day_variant_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(day_variant_row);

		const night_variant_row = new SettingsListRow(_('Night variant'), new TimeCursorVariantControl('night'));
		settings.bind(
			'cursor-variants-enabled',
			night_variant_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(night_variant_row);

		return new SettingsPage(label, description, content);
	}

}


class CursorVariantsEnabledControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const toggle = new Gtk.Switch({
			active: settings.get_boolean('cursor-variants-enabled')
		});
		settings.bind(
			'cursor-variants-enabled',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class TimeCursorVariantControl {

	constructor(time) {
		const settings = extensionUtils.getSettings();
		const combo = new Gtk.ComboBoxText();
		const themes = Array.from(get_installed_cursor_themes()).sort();
		themes.forEach(theme => combo.append(theme, theme));
		settings.bind(
			`cursor-variant-${time}`,
			combo,
			'active-id',
			Gio.SettingsBindFlags.DEFAULT
		);
		return combo;
	}

}
