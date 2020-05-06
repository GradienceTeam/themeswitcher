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

'use strict';

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const { log_debug } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


let settings;


function init() {
	log_debug('Initializing preferences...');
	settings = extensionUtils.getSettings();
	extensionUtils.initTranslations(Me.metadata.uuid);
	log_debug('Preferences initialized.');
}

function buildPrefsWidget() {
	const prefs_widget = new Gtk.Box({
		orientation: Gtk.Orientation.VERTICAL,
		spacing: 30,
		margin_top: 30,
		margin_end: 36,
		margin_start: 36,
		valign: Gtk.Align.START,
		halign: Gtk.Align.CENTER,
		width_request: 450,
		margin_bottom: 36,
		visible: true
	})

	const prefs_info = new Gtk.Label({
		label: _('The extension will try to use Night Light or Location Services to automatically set your current sunrise and sunset times if they are enabled.\nIf you prefer, you can set a manual schedule.'),
		wrap: true,
		max_width_chars: 60,
		halign: Gtk.Align.FILL,
		opacity: 0.7,
		visible: true
	});
	prefs_widget.pack_start(prefs_info, true, true, 0);

	const prefs_frame = new Gtk.Frame({
		can_focus: false,
		visible: true
	});
	prefs_widget.pack_start(prefs_frame, true, true, 0);

	const prefs_list = new Gtk.ListBox({
		border_width: 0,
		margin: 0,
		can_focus: false,
		selection_mode: Gtk.SelectionMode.NONE,
		visible: true
	});
	prefs_frame.add(prefs_list);

	// Force manual toggle
	const force_manual_box = new Gtk.Box({
		margin: 16,
		spacing: 12,
		orientation: Gtk.Orientation.HORIZONTAL,
		can_focus: false,
		visible: true
	});
	prefs_list.add(force_manual_box);

	const force_manual_label = new Gtk.Label({
		label: _('Manual schedule:'),
		halign: Gtk.Align.START,
		visible: true
	});
	force_manual_box.pack_start(force_manual_label, true, true, 0);

	const force_manual_toggle = new Gtk.Switch({
		active: this.settings.get_boolean('time-force-manual'),
		halign: Gtk.Align.END,
		visible: true
	});
	settings.bind(
		'time-force-manual',
		force_manual_toggle,
		'active',
		Gio.SettingsBindFlags.DEFAULT
	);
	force_manual_box.pack_start(force_manual_toggle, false, false, 0);

	prefs_list.add(new Gtk.Separator({
		orientation: Gtk.Orientation.VERTICAL,
		can_focus: false,
		visible: true
	}));

	// Times schedule
	['sunrise', 'sunset'].forEach((suntime, i, suntimes) => {
		const time_box = new Gtk.Box({
			margin: 16,
			spacing: 12,
			orientation: Gtk.Orientation.HORIZONTAL,
			can_focus: false,
			visible: true
		});
		prefs_list.add(time_box);

		if ( i < suntimes.length - 1 ) {
			prefs_list.add(new Gtk.Separator({
				orientation: Gtk.Orientation.VERTICAL,
				can_focus: false,
				visible: true
			}));
		}

		const time_labels = new Map([
			['sunrise', _('Sunrise: ')],
			['sunset', _('Sunset: ')]
		]);
		const time_label = new Gtk.Label({
			label: time_labels.get(suntime),
			halign: Gtk.Align.START,
			visible: true
		})
		time_box.pack_start(time_label, true, true, 0);

		const time = settings.get_double(`time-${suntime}`);
		const hour = Math.trunc(time);
		const minutes = Math.round((time - hour) * 60);

		const time_hour_spin = new Gtk.SpinButton({
			adjustment: new Gtk.Adjustment({
				value: hour,
				lower: 0,
				upper: 23,
				step_increment: 1,
				page_increment: 0,
				page_size: 0
			}),
			value: hour,
			numeric: true,
			wrap: true,
			orientation: Gtk.Orientation.VERTICAL,
			visible: true
		});
		settings.bind(
			'time-force-manual',
			time_hour_spin,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		settings.connect(`changed::time-${suntime}`, () => {
			const hour = Math.trunc(settings.get_double(`time-${suntime}`));
			time_hour_spin.value = hour;
		});
		time_hour_spin.connect('output', () => {
			const text = time_hour_spin.adjustment.value.toString().padStart(2, '0');
			time_hour_spin.set_text(text);
			return true;
		});
		time_hour_spin.connect('value-changed', () => {
			const old_time = settings.get_double(`time-${suntime}`);
			const old_hour = Math.trunc(old_time);
			const minutes = old_time - old_hour;
			const new_time = time_hour_spin.value + minutes;
			settings.set_double(`time-${suntime}`, new_time);
		});
		time_box.pack_start(time_hour_spin, false, false, 0);

		const time_separator = new Gtk.Label({
			label: ':',
			visible: true
		})
		time_box.pack_start(time_separator, false, false, 0);

		const time_minutes_spin = new Gtk.SpinButton({
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
			orientation: Gtk.Orientation.VERTICAL,
			visible: true
		});
		settings.bind(
			'time-force-manual',
			time_minutes_spin,
			'sensitive',
			Gio.SettingsBindFlags.DEFAULT
		);
		settings.connect(`changed::time-${suntime}`, () => {
			const time = settings.get_double(`time-${suntime}`);
			const hour = Math.trunc(time);
			const minutes = Math.round((time - hour) * 60);
			time_minutes_spin.value = minutes;
		});
		time_minutes_spin.connect('output', () => {
			const text = time_minutes_spin.adjustment.value.toString().padStart(2, '0');
			time_minutes_spin.set_text(text);
			return true;
		});
		time_minutes_spin.connect('value-changed', () => {
			const hour = Math.trunc(settings.get_double(`time-${suntime}`));
			const minutes = time_minutes_spin.value / 60;
			const new_time = hour + minutes;
			settings.set_double(`time-${suntime}`, new_time);
		});
		time_box.pack_start(time_minutes_spin, false, false, 0);
	});

	return prefs_widget;
}
