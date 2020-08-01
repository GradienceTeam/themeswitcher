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
const { getInstalledGtkThemes } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


var GtkThemePreferences = class {

    constructor() {
        const settings = compat.getExtensionSettings();

        const label = _('GTK theme');
        const description = _('The extension will try to automatically detect the day and night variants of your GTK theme.\n\nIf the theme you use isn\'t supported, please <a href="https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/-/issues">submit a request</a>. You can also manually set variants.');
        const content = new SettingsList();

        content.add_row(new SettingsListRow(_('Switch GTK variants'), new GtkVariantsEnabledControl()));

        const manualVariantsRow = new SettingsListRow(_('Manual variants'), new ManualGtkVariantsControl());
        settings.bind(
            'gtk-variants-enabled',
            manualVariantsRow,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        content.add_row(manualVariantsRow);

        const dayVariantRow = new SettingsListRow(_('Day variant'), new TimeGtkVariantControl('day'));
        const updateDayVariantRowSensitivity = () => dayVariantRow.set_sensitive(!!(settings.get_boolean('gtk-variants-enabled') && settings.get_boolean('manual-gtk-variants')));
        settings.connect('changed::gtk-variants-enabled', updateDayVariantRowSensitivity);
        settings.connect('changed::manual-gtk-variants', updateDayVariantRowSensitivity);
        updateDayVariantRowSensitivity();
        content.add_row(dayVariantRow);

        const nightVariantRow = new SettingsListRow(_('Night variant'), new TimeGtkVariantControl('night'));
        const updateNightVariantRowSensitivity = () => nightVariantRow.set_sensitive(!!(settings.get_boolean('gtk-variants-enabled') && settings.get_boolean('manual-gtk-variants')));
        settings.connect('changed::gtk-variants-enabled', updateNightVariantRowSensitivity);
        settings.connect('changed::manual-gtk-variants', updateNightVariantRowSensitivity);
        updateNightVariantRowSensitivity();
        content.add_row(nightVariantRow);

        return new SettingsPage(label, description, content);
    }

};


class GtkVariantsEnabledControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: settings.get_boolean('gtk-variants-enabled'),
        });
        settings.bind(
            'gtk-variants-enabled',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        return toggle;
    }

}


class ManualGtkVariantsControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: false,
        });
        settings.bind(
            'manual-gtk-variants',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        return toggle;
    }

}


class TimeGtkVariantControl {

    constructor(time) {
        const settings = compat.getExtensionSettings();
        const combo = new Gtk.ComboBoxText();
        const themes = Array.from(getInstalledGtkThemes()).sort();
        themes.forEach(theme => combo.append(theme, theme));
        settings.bind(
            `gtk-variant-${time}`,
            combo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        return combo;
    }

}
