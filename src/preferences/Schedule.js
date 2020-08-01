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

const compat = Me.imports.compat;
const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


var SchedulePreferences = class {

    constructor() {
        const settings = compat.getExtensionSettings();

        const label = _('Schedule');
        const description = _('The extension will try to use Night Light or Location Services to automatically set your current sunrise and sunset times if they are enabled.\n\nIf you prefer, you can manually choose a time source.');
        const content = new SettingsList();

        content.add_row(new SettingsListRow(_('Automatic time source'), new ManualTimeSourceControl()));

        const timeSourceRow = new SettingsListRow(_('Time source'), new TimeSourceControl());
        settings.bind(
            'manual-time-source',
            timeSourceRow,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        content.add_row(timeSourceRow);

        const ondemandShortcutRow = new SettingsListRow(_('On-demand shortcut'), new KeyBindingControl());
        const updateOndemandShortcutRowSensitivity = () => ondemandShortcutRow.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'ondemand'));
        settings.connect('changed::manual-time-source', () => updateOndemandShortcutRowSensitivity());
        settings.connect('changed::time-source', () => updateOndemandShortcutRowSensitivity());
        updateOndemandShortcutRowSensitivity();
        content.add_row(ondemandShortcutRow);

        const sunriseRow = new SettingsListRow(_('Sunrise'), new SuntimeControl('sunrise'));
        const updateSunriseRowSensitivity = () => sunriseRow.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'schedule'));
        settings.connect('changed::manual-time-source', () => updateSunriseRowSensitivity());
        settings.connect('changed::time-source', () => updateSunriseRowSensitivity());
        updateSunriseRowSensitivity();
        content.add_row(sunriseRow);

        const sunsetRow = new SettingsListRow(_('Sunset'), new SuntimeControl('sunset'));
        const updateSunsetRowSensitivity = () => sunsetRow.set_sensitive(!!(settings.get_boolean('manual-time-source') && settings.get_string('time-source') === 'schedule'));
        settings.connect('changed::manual-time-source', () => updateSunsetRowSensitivity());
        settings.connect('changed::time-source', () => updateSunsetRowSensitivity());
        updateSunsetRowSensitivity();
        content.add_row(sunsetRow);

        return new SettingsPage(label, description, content);
    }

};

class ManualTimeSourceControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: false,
        });
        settings.bind(
            'manual-time-source',
            toggle,
            'active',
            Gio.SettingsBindFlags.INVERT_BOOLEAN
        );
        return toggle;
    }

}


class TimeSourceControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        const locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });

        const box = new Gtk.Box({
            spacing: 8,
            orientation: Gtk.Orientation.HORIZONTAL,
            can_focus: false,
        });

        const nightlightRadio = new Gtk.RadioButton({
            label: _('Night Light'),
            active: settings.get_string('time-source') === 'nightlight',
        });
        nightlightRadio.connect('toggled', () => {
            if (nightlightRadio.get_active())
                settings.set_string('time-source', 'nightlight');
        });
        colorSettings.bind(
            'night-light-enabled',
            nightlightRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        box.pack_start(nightlightRadio, false, false, 0);

        const locationRadio = new Gtk.RadioButton({
            label: _('Location Services'),
            group: nightlightRadio,
            active: settings.get_string('time-source') === 'location',
        });
        locationRadio.connect('toggled', () => {
            if (locationRadio.get_active())
                settings.set_string('time-source', 'location');
        });
        locationSettings.bind(
            'enabled',
            locationRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        box.pack_start(locationRadio, false, false, 0);

        const scheduleRadio = new Gtk.RadioButton({
            label: _('Manual schedule'),
            group: nightlightRadio,
            active: settings.get_string('time-source') === 'schedule',
        });
        scheduleRadio.connect('toggled', () => {
            if (scheduleRadio.get_active())
                settings.set_string('time-source', 'schedule');
        });
        settings.bind(
            'manual-time-source',
            scheduleRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        box.pack_start(scheduleRadio, false, false, 0);

        const ondemandRadio = new Gtk.RadioButton({
            label: _('On-demand'),
            group: nightlightRadio,
            active: settings.get_string('time-source') === 'ondemand',
        });
        ondemandRadio.connect('toggled', () => {
            settings.set_string('time-source', 'ondemand');
        });
        settings.bind(
            'manual-time-source',
            ondemandRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        box.pack_start(ondemandRadio, false, false, 0);

        return box;
    }

}


class KeyBindingControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const KEYBINDING_KEY = 'nightthemeswitcher-ondemand-keybinding';
        const COLUMN_KEY = 0;
        const COLUMN_MODS = 1;

        const listStore = new Gtk.ListStore();
        listStore.set_column_types([GObject.TYPE_INT, GObject.TYPE_INT]);
        const treeView = new Gtk.TreeView({ model: listStore });
        treeView.set_headers_visible(false);

        const renderer = new Gtk.CellRendererAccel({ editable: true });
        const column = new Gtk.TreeViewColumn();
        const iter = listStore.append();

        const updateShortcutRow = accel => {
            const [key, mods] = accel ? Gtk.accelerator_parse(accel) : [0, 0];
            listStore.set(iter, [COLUMN_KEY, COLUMN_MODS], [key, mods]);
        };

        renderer.connect('accel-edited', (_renderer, _path, key, mods) => {
            const accel = Gtk.accelerator_name(key, mods);
            updateShortcutRow(accel);
            settings.set_strv(KEYBINDING_KEY, [accel]);
        });

        renderer.connect('accel-cleared', () => {
            updateShortcutRow(null);
            settings.set_strv(KEYBINDING_KEY, []);
        });

        settings.connect(`changed::${KEYBINDING_KEY}`, () => {
            updateShortcutRow(settings.get_strv(KEYBINDING_KEY)[0]);
        });

        column.pack_start(renderer, true);
        column.add_attribute(renderer, 'accel-key', COLUMN_KEY);
        column.add_attribute(renderer, 'accel-mods', COLUMN_MODS);

        treeView.append_column(column);
        updateShortcutRow(settings.get_strv(KEYBINDING_KEY)[0]);

        return treeView;
    }

}


class SuntimeControl {

    constructor(suntime) {
        const settings = compat.getExtensionSettings();
        const box = new Gtk.Box({
            spacing: 8,
            orientation: Gtk.Orientation.HORIZONTAL,
            can_focus: false,
        });

        const time = settings.get_double(`schedule-${suntime}`);
        const hours = Math.trunc(time);
        const minutes = Math.round((time - hours) * 60);

        const hoursSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                value: hours,
                lower: 0,
                upper: 23,
                step_increment: 1,
                page_increment: 0,
                page_size: 0,
            }),
            value: hours,
            numeric: true,
            wrap: true,
            orientation: Gtk.Orientation.VERTICAL,
        });
        hoursSpin.connect('output', () => {
            const text = hoursSpin.adjustment.value.toString().padStart(2, '0');
            hoursSpin.set_text(text);
            return true;
        });
        hoursSpin.connect('value-changed', () => {
            const oldTime = settings.get_double(`schedule-${suntime}`);
            const oldHour = Math.trunc(oldTime);
            const newMinutes = oldTime - oldHour;
            const newTime = hoursSpin.value + newMinutes;
            settings.set_double(`schedule-${suntime}`, newTime);
        });

        const separator = new Gtk.Label({ label: ':' });

        const minutesSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                value: minutes,
                lower: 0,
                upper: 59,
                step_increment: 1,
                page_increment: 0,
                page_size: 0,
            }),
            value: minutes,
            numeric: true,
            wrap: true,
            orientation: Gtk.Orientation.VERTICAL,
        });
        minutesSpin.connect('output', () => {
            const text = minutesSpin.adjustment.value.toString().padStart(2, '0');
            minutesSpin.set_text(text);
            return true;
        });
        minutesSpin.connect('value-changed', () => {
            const hour = Math.trunc(settings.get_double(`schedule-${suntime}`));
            const newMinutes = minutesSpin.value / 60;
            const newTime = hour + newMinutes;
            settings.set_double(`schedule-${suntime}`, newTime);
        });

        box.pack_start(hoursSpin, false, false, 0);
        box.pack_start(separator, false, false, 0);
        box.pack_start(minutesSpin, false, false, 0);
        return box;
    }

}
