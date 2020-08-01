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
const { getInstalledShellThemes } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


var ShellThemePreferences = class {

    constructor() {
        const settings = compat.getExtensionSettings();

        const label = _('Shell theme');
        const description = _('The extension will try to automatically detect the day and night variants of your GNOME Shell theme.\n\nIf the theme you use isn\'t supported, please <a href="https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/-/issues">submit a request</a>. You can also manually set variants.');
        const content = new SettingsList();

        content.add_row(new SettingsListRow(_('Switch Shell variants'), new ShellVariantsEnabledControl()));

        const manualVariantsRow = new SettingsListRow(_('Manual variants'), new ManualShellVariantsControl());
        settings.bind(
            'shell-variants-enabled',
            manualVariantsRow,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        content.add_row(manualVariantsRow);

        const dayVariantRow = new SettingsListRow(_('Day variant'), new TimeShellVariantControl('day'));
        const updateDayVariantRowSensitivity = () => dayVariantRow.set_sensitive(!!(settings.get_boolean('shell-variants-enabled') && settings.get_boolean('manual-shell-variants')));
        settings.connect('changed::shell-variants-enabled', updateDayVariantRowSensitivity);
        settings.connect('changed::manual-shell-variants', updateDayVariantRowSensitivity);
        updateDayVariantRowSensitivity();
        content.add_row(dayVariantRow);

        const nightVariantRow = new SettingsListRow(_('Night variant'), new TimeShellVariantControl('night'));
        const updateNightVariantRowSensitivity = () => nightVariantRow.set_sensitive(!!(settings.get_boolean('shell-variants-enabled') && settings.get_boolean('manual-shell-variants')));
        settings.connect('changed::shell-variants-enabled', updateNightVariantRowSensitivity);
        settings.connect('changed::manual-shell-variants', updateNightVariantRowSensitivity);
        updateNightVariantRowSensitivity();
        content.add_row(nightVariantRow);

        return new SettingsPage(label, description, content);
    }

};


class ShellVariantsEnabledControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: settings.get_boolean('shell-variants-enabled'),
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
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: false,
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
        const settings = compat.getExtensionSettings();
        const combo = new Gtk.ComboBoxText();
        const themes = Array.from(getInstalledShellThemes()).sort();
        themes.forEach(theme => combo.append(theme, theme === '' ? _('Default') : theme));
        settings.bind(
            `shell-variant-${time}`,
            combo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        return combo;
    }

}
