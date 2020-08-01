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

const compat = Me.imports.compat;
const { SettingsPage, SettingsList, SettingsListRow } = Me.imports.preferences.bases;
const { getInstalledIconThemes } = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


var IconThemePreferences = class {

    constructor() {
        const settings = compat.getExtensionSettings();

        const label = _('Icon theme');
        const description = _('You can set different icon themes for day and night.');
        const content = new SettingsList();

        content.add_row(new SettingsListRow(_('Switch icon variants'), new IconVariantsEnabledControl()));

        const dayVariantRow = new SettingsListRow(_('Day variant'), new TimeIconVariantControl('day'));
        settings.bind(
            'icon-variants-enabled',
            dayVariantRow,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        content.add_row(dayVariantRow);

        const nightVariantRow = new SettingsListRow(_('Night variant'), new TimeIconVariantControl('night'));
        settings.bind(
            'icon-variants-enabled',
            nightVariantRow,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        content.add_row(nightVariantRow);

        return new SettingsPage(label, description, content);
    }

};


class IconVariantsEnabledControl {

    constructor() {
        const settings = compat.getExtensionSettings();
        const toggle = new Gtk.Switch({
            active: settings.get_boolean('icon-variants-enabled'),
        });
        settings.bind(
            'icon-variants-enabled',
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        return toggle;
    }

}


class TimeIconVariantControl {

    constructor(time) {
        const settings = compat.getExtensionSettings();
        const combo = new Gtk.ComboBoxText();
        const themes = Array.from(getInstalledIconThemes()).sort();
        themes.forEach(theme => combo.append(theme, theme));
        settings.bind(
            `icon-variant-${time}`,
            combo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        return combo;
    }

}
