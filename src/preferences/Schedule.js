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

const { Gio, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);
if ( shell_minor_version <= 30 ) {
	extensionUtils.getSettings = Me.imports.convenience.getSettings;
}


var SchedulePreferences = class {

	constructor() {
		const settings = extensionUtils.getSettings();

		const label = _('Schedule');
		const description = _('The extension will try to use Night Light or Location Services to automatically set your current sunrise and sunset times if they are enabled.\n\nIf you prefer, you can manually choose a time source.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Manual time source'), new ManualTimeSourceControl()));

		const time_source_row = new SettingsListRow(_('Time source'), new TimeSourceControl());
		settings.bind(
			'manual-time-source',
			time_source_row,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		content.add_row(time_source_row);

		const ondemand_shortcut_row = new SettingsListRow(_('On-demand shortcut'), new KeyBindingControl());
		const update_ondemand_shortcut_row_sensitivity = () => ondemand_shortcut_row.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'ondemand'));
		settings.connect('changed::manual-time-source', () => update_ondemand_shortcut_row_sensitivity());
		settings.connect('changed::time-source', () => update_ondemand_shortcut_row_sensitivity());
		update_ondemand_shortcut_row_sensitivity();
		content.add_row(ondemand_shortcut_row);

		const sunrise_row = new SettingsListRow(_('Sunrise'), new SuntimeControl('sunrise'));
		const update_sunrise_row_sensitivity = () => sunrise_row.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'schedule'));
		settings.connect('changed::manual-time-source', () => update_sunrise_row_sensitivity());
		settings.connect('changed::time-source', () => update_sunrise_row_sensitivity());
		update_sunrise_row_sensitivity();
		content.add_row(sunrise_row);

		const sunset_row = new SettingsListRow(_('Sunset'), new SuntimeControl('sunset'));
		const update_sunset_row_sensitivity = () => sunset_row.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'schedule'));
		settings.connect('changed::manual-time-source', () => update_sunset_row_sensitivity());
		settings.connect('changed::time-source', () => update_sunset_row_sensitivity());
		update_sunset_row_sensitivity();
		content.add_row(sunset_row);

		return new SettingsPage(label, description, content);
	}

}

class ManualTimeSourceControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const toggle = new Gtk.Switch({
			active: false
		});
		settings.bind(
			'manual-time-source',
			toggle,
			'active',
			Gio.SettingsBindFlags.DEFAULT
		);
		return toggle;
	}

}


class TimeSourceControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
		const locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });

		const box = new Gtk.Box({
			spacing: 8,
			orientation: Gtk.Orientation.HORIZONTAL,
			can_focus: false
		});

		const nightlight_radio = new Gtk.RadioButton({
			label: _('Night Light'),
			active: (settings.get_string('time-source') === 'nightlight')
		});
		nightlight_radio.connect('toggled', () => {
			if ( nightlight_radio.get_active() ) {
				settings.set_string('time-source', 'nightlight')
			}
		});
		colorSettings.bind(
			'night-light-enabled',
			nightlight_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		box.pack_start(nightlight_radio, false, false, 0);

		const location_radio = new Gtk.RadioButton({
			label: _('Location Services'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'location')
		});
		location_radio.connect('toggled', () => {
			if ( location_radio.get_active() ) {
				settings.set_string('time-source', 'location')
			}
		});
		locationSettings.bind(
			'enabled',
			location_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		box.pack_start(location_radio, false, false, 0);

		const schedule_radio = new Gtk.RadioButton({
			label: _('Manual schedule'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'schedule')
		});
		schedule_radio.connect('toggled', () => {
			if ( schedule_radio.get_active() ) {
				settings.set_string('time-source', 'schedule')
			}
		});
		settings.bind(
			'manual-time-source',
			schedule_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		box.pack_start(schedule_radio, false, false, 0);

		const ondemand_radio = new Gtk.RadioButton({
			label: _('On-demand'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'ondemand')
		});
		ondemand_radio.connect('toggled', () => {
			settings.set_string('time-source', 'ondemand')
		});
		settings.bind(
			'manual-time-source',
			ondemand_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		box.pack_start(ondemand_radio, false, false, 0);

		return box;
	}

}


class KeyBindingControl {

	constructor() {
		const settings = extensionUtils.getSettings();
		const KEYBINDING_KEY = 'nightthemeswitcher-ondemand-keybinding';
		const COLUMN_KEY = 0;
		const COLUMN_MODS = 1;

		const list_store = new Gtk.ListStore();
		list_store.set_column_types([GObject.TYPE_INT, GObject.TYPE_INT]);
		const tree_view = new Gtk.TreeView({model: list_store});
		tree_view.set_headers_visible(false);

		const renderer = new Gtk.CellRendererAccel({ editable: true});
		const column = new Gtk.TreeViewColumn();
		const iter = list_store.append();

		const update_shortcut_row = (accel) => {
			const [key, mods] = accel ? Gtk.accelerator_parse(accel) : [0, 0];
			list_store.set(iter, [COLUMN_KEY, COLUMN_MODS], [key, mods]);
		};

		renderer.connect('accel-edited', (renderer, path, key, mods) => {
			const accel = Gtk.accelerator_name(key, mods);
			update_shortcut_row(accel);
			settings.set_strv(KEYBINDING_KEY, [accel]);
		});

		renderer.connect('accel-cleared', () => {
			update_shortcut_row(null);
			settings.set_strv(KEYBINDING_KEY, []);
		});

		settings.connect(`changed::${KEYBINDING_KEY}`, () => {
			update_shortcut_row(settings.get_strv(KEYBINDING_KEY)[0]);
		});

		column.pack_start(renderer, true);
		column.add_attribute(renderer, 'accel-key', COLUMN_KEY);
		column.add_attribute(renderer, 'accel-mods', COLUMN_MODS);

		tree_view.append_column(column);
		update_shortcut_row(settings.get_strv(KEYBINDING_KEY)[0]);

		return tree_view;
	}

}


class SuntimeControl {

	constructor(suntime) {
		const settings = extensionUtils.getSettings();
		const box = new Gtk.Box({
			spacing: 8,
			orientation: Gtk.Orientation.HORIZONTAL,
			can_focus: false
		});

		const time = settings.get_double(`schedule-${suntime}`);
		const hours = Math.trunc(time);
		const minutes = Math.round((time - hours) * 60);

		const hours_spin = new Gtk.SpinButton({
			adjustment: new Gtk.Adjustment({
				value: hours,
				lower: 0,
				upper: 23,
				step_increment: 1,
				page_increment: 0,
				page_size: 0
			}),
			value: hours,
			numeric: true,
			wrap: true,
			orientation: Gtk.Orientation.VERTICAL
		});
		hours_spin.connect('output', () => {
			const text = hours_spin.adjustment.value.toString().padStart(2, '0');
			hours_spin.set_text(text);
			return true;
		});
		hours_spin.connect('value-changed', () => {
			const old_time = settings.get_double(`schedule-${suntime}`);
			const old_hour = Math.trunc(old_time);
			const minutes = old_time - old_hour;
			const new_time = hours_spin.value + minutes;
			settings.set_double(`schedule-${suntime}`, new_time);
		});

		const separator = new Gtk.Label({ label: ':' });

		const minutes_spin = new Gtk.SpinButton({
			adjustment: new Gtk.Adjustment({
				value: minutes,
				lower: 0,
				upper: 59,
				step_increment: 1,
				page_increment: 0,
				page_size: 0
			}),
			value: minutes,
			numeric: true,
			wrap: true,
			orientation: Gtk.Orientation.VERTICAL
		});
		minutes_spin.connect('output', () => {
			const text = minutes_spin.adjustment.value.toString().padStart(2, '0');
			minutes_spin.set_text(text);
			return true;
		});
		minutes_spin.connect('value-changed', () => {
			const hour = Math.trunc(settings.get_double(`schedule-${suntime}`));
			const minutes = minutes_spin.value / 60;
			const new_time = hour + minutes;
			settings.set_double(`schedule-${suntime}`, new_time);
		});

		box.pack_start(hours_spin, false, false, 0);
		box.pack_start(separator, false, false, 0);
		box.pack_start(minutes_spin, false, false, 0);
		return box;
	}

}
