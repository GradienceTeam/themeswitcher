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
const { get_installed_shell_themes } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


var ShellThemePreferences = class {

	constructor() {
		const settings = extensionUtils.getSettings();

		const label = _('Shell theme');
		const description = _('The extension will try to automatically detect the day and night variants of your GNOME Shell theme.\n\nIf the theme you use isn\'t supported, please <a href="https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/-/issues">submit a request</a>. You can also manually set variants.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Switch Shell variants'), new ShellVariantsEnabledControl()));

		const manual_variants_row = new SettingsListRow(_('Manual variants'), new ManualShellVariantsControl());
		settings.bind(
			'shell-variants-enabled',
			manual_variants_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(manual_variants_row);

		const day_variant_row = new SettingsListRow(_('Day variant'), new TimeShellVariantControl('day'));
		const update_day_variant_row_sensitivity = () => day_variant_row.set_sensitive(!!(settings.get_boolean('shell-variants-enabled') && settings.get_boolean('manual-shell-variants')));
		settings.connect('changed::shell-variants-enabled', update_day_variant_row_sensitivity);
		settings.connect('changed::manual-shell-variants', update_day_variant_row_sensitivity)
		update_day_variant_row_sensitivity();
		content.add_row(day_variant_row);

		const night_variant_row = new SettingsListRow(_('Night variant'), new TimeShellVariantControl('night'));
		const update_night_variant_row_sensitivity = () => night_variant_row.set_sensitive(!!(settings.get_boolean('shell-variants-enabled') && settings.get_boolean('manual-shell-variants')));
		settings.connect('changed::shell-variants-enabled', update_night_variant_row_sensitivity);
		settings.connect('changed::manual-shell-variants', update_night_variant_row_sensitivity)
		update_night_variant_row_sensitivity();
		content.add_row(night_variant_row);

		return new SettingsPage(label, description, content);
	}

}


class ShellVariantsEnabledControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const toggle = new Gtk.Switch({
			active: settings.get_boolean('shell-variants-enabled')
		});
		settings.bind(
			'shell-variants-enabled',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class ManualShellVariantsControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const toggle = new Gtk.Switch({
			active: false
		});
		settings.bind(
			'manual-shell-variants',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class TimeShellVariantControl {

	constructor(time) {
		const settings = extensionUtils.getSettings();
		const combo = new Gtk.ComboBoxText();
		const themes = Array.from(get_installed_shell_themes()).sort();
		themes.forEach(theme => combo.append(theme, (theme === '' ? _('Default') : theme)));
		settings.bind(
			`shell-variant-${time}`,
			combo,
			'active-id',
			Gio.SettingsBindFlags.DEFAULT
		);
		return combo;
	}

}
