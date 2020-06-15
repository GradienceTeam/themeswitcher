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

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


var BackgroundsPreferences = class {

	constructor() {
		const settings = extensionUtils.getSettings();

		const label = _('Backgrounds');
		const description = _('You can set different backgrounds for day and night.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Switch backgrounds'), new BackgroundsEnabledControl()));

		const day_background_row = new SettingsListRow(_('Day background'), new TimeBackgroundControl('day'));
		settings.bind(
			'backgrounds-enabled',
			day_background_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(day_background_row);

		const night_background_row = new SettingsListRow(_('Night background'), new TimeBackgroundControl('night'));
		settings.bind(
			'backgrounds-enabled',
			night_background_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(night_background_row);

		return new SettingsPage(label, description, content);
	}

}


class BackgroundsEnabledControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const toggle = new Gtk.Switch({
			active: settings.get_boolean('backgrounds-enabled')
		});
		settings.bind(
			'backgrounds-enabled',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class TimeBackgroundControl {

	constructor(time) {
		const settings = extensionUtils.getSettings();

		const filter = new Gtk.FileFilter();
		filter.add_mime_type('image/jpeg');
		filter.add_mime_type('image/png');
		filter.add_mime_type('image/tiff');

		const preview = new Gtk.Image({
			pixel_size: 256
		});

		const button = new Gtk.FileChooserButton({
			title: _('Select your background image'),
			action: Gtk.FileChooserAction.OPEN,
			filter: filter,
			preview_widget: preview,
			use_preview_label: false
		});
		button.set_uri(settings.get_string(`background-${time}`));
		button.connect('update-preview', () => {
			const file = button.get_preview_filename();
			const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(file, 256, 256);
			preview.set_from_pixbuf(pixbuf);
		});
		button.connect('file-set', () => settings.set_string(`background-${time}`, button.get_uri()));
		settings.connect(`changed::background-${time}`, () => button.set_uri(settings.get_string(`background-${time}`)));

		return button;
	}

}
