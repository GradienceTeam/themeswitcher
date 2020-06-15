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
		const label = _('Schedule');
		const description = _('The extension will try to use Night Light or Location Services to automatically set your current sunrise and sunset times if they are enabled.\n\nIf you prefer, you can manually choose a time source.');
		const content = new SettingsList();

		content.add_row(new SettingsListRow(_('Manual time source'), new ManualTimeSourceControl()));
		content.add_row(new SettingsListRow(_('Time source'), new TimeSourceControl()));
		content.add_row(new SettingsListRow(_('Shortcut'), new KeyBindingControl()));
		content.add_row(new SettingsListRow(_('Sunrise'), new SuntimeControl('sunrise')));
		content.add_row(new SettingsListRow(_('Sunset'), new SuntimeControl('sunset')));

		return new SettingsPage(label, description, content);
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

		const update_treeview_sensitivity = (tree_view) => {
			tree_view.set_sensitive(!!(settings.get_string('time-source') === 'ondemand'));
		}
		settings.connect('changed::time-source', () => update_treeview_sensitivity(tree_view));
		update_treeview_sensitivity(tree_view)

		return tree_view;
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
		const update_nightlight_radio_sensitivity = () => nightlight_radio.set_sensitive(!!(settings.get_boolean('manual-time-source') && colorSettings.get_boolean('night-light-enabled')));
		settings.connect('changed::manual-time-source', update_nightlight_radio_sensitivity);
		colorSettings.connect('changed::night-light-enabled', update_nightlight_radio_sensitivity);
		update_nightlight_radio_sensitivity();
		nightlight_radio.connect('toggled', () => {
			if ( nightlight_radio.get_active() ) {
				settings.set_string('time-source', 'nightlight')
			}
		});
		box.pack_start(nightlight_radio, false, false, 0);

		const location_radio = new Gtk.RadioButton({
			label: _('Location Services'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'location')
		});
		const update_location_radio_sensitivity = () => location_radio.set_sensitive(!!(settings.get_boolean('manual-time-source') && locationSettings.get_boolean('enabled')));
		settings.connect('changed::manual-time-source', update_location_radio_sensitivity);
		locationSettings.connect('changed::enabled', update_location_radio_sensitivity);
		update_location_radio_sensitivity();
		location_radio.connect('toggled', () => {
			if ( location_radio.get_active() ) {
				settings.set_string('time-source', 'location')
			}
		});
		box.pack_start(location_radio, false, false, 0);

		const schedule_radio = new Gtk.RadioButton({
			label: _('Manual schedule'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'schedule')
		});
		settings.bind(
			'manual-time-source',
			schedule_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		schedule_radio.connect('toggled', () => {
			if ( schedule_radio.get_active() ) {
				settings.set_string('time-source', 'schedule')
			}
		});
		box.pack_start(schedule_radio, false, false, 0);

		const ondemand_radio = new Gtk.RadioButton({
			label: _('On-demand'),
			group: nightlight_radio,
			active: (settings.get_string('time-source') === 'ondemand')
		});
		settings.bind(
			'manual-time-source',
			ondemand_radio,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		ondemand_radio.connect('toggled', () => {
			settings.set_string('time-source', 'ondemand')
		});
		box.pack_start(ondemand_radio, false, false, 0);


		return box;
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

		const update_spin_sensitivity = (spin) => spin.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'schedule'));

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
		settings.connect('changed::manual-time-source', () => update_spin_sensitivity(hours_spin));
		settings.connect('changed::time-source', () => update_spin_sensitivity(hours_spin));
		update_spin_sensitivity(hours_spin);

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
		settings.connect('changed::manual-time-source', () => update_spin_sensitivity(minutes_spin));
		settings.connect('changed::time-source', () => update_spin_sensitivity(minutes_spin));
		update_spin_sensitivity(minutes_spin);

		box.pack_start(hours_spin, false, false, 0);
		box.pack_start(separator, false, false, 0);
		box.pack_start(minutes_spin, false, false, 0);
		return box;
	}

}
