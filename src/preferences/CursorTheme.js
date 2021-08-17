// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var CursorThemePreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'cursor_theme.ui']));

        this.widget = this._builder.get_object('cursor_theme');
        this.name = 'cursor-theme';
        this.title = _('Cursor theme');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.cursorVariants.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const variants = this._builder.get_object('variants');
        settings.cursorVariants.settings.bind(
            'enabled',
            variants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const installedCursorThemes = Array.from(utils.getInstalledCursorThemes()).sort();
        const dayCombo = this._builder.get_object('day_combo');
        const nightCombo = this._builder.get_object('night_combo');
        installedCursorThemes.forEach(theme => {
            dayCombo.append(theme, theme);
            nightCombo.append(theme, theme);
        });
        settings.cursorVariants.settings.bind(
            'day',
            dayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        settings.cursorVariants.settings.bind(
            'night',
            nightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
};
