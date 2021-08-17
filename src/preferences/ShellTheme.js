// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const utils = Me.imports.utils;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var ShellThemePreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'shell_theme.ui']));

        this.widget = this._builder.get_object('shell_theme');
        this.name = 'shell-theme';
        this.title = _('Shell theme');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.shellVariants.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manual = this._builder.get_object('manual');
        settings.shellVariants.settings.bind(
            'enabled',
            manual,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const manualSwitch = this._builder.get_object('manual_switch');
        settings.shellVariants.settings.bind(
            'manual',
            manualSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const variants = this._builder.get_object('variants');
        const updateVariantsSensitivity = () => {
            variants.sensitive = !!(settings.shellVariants.enabled && settings.shellVariants.manual);
        };
        settings.shellVariants.connect('status-changed', () => updateVariantsSensitivity());
        settings.shellVariants.connect('manual-changed', () => updateVariantsSensitivity());
        updateVariantsSensitivity();

        const dayCombo = this._builder.get_object('day_combo');
        const nightCombo = this._builder.get_object('night_combo');
        const installedShellThemes = Array.from(utils.getInstalledShellThemes()).sort();
        installedShellThemes.forEach(theme => {
            const themeName = theme === '' ? _('Default') : theme;
            dayCombo.append(theme, themeName);
            nightCombo.append(theme, themeName);
        });
        settings.shellVariants.settings.bind(
            'day',
            dayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        settings.shellVariants.settings.bind(
            'night',
            nightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
};
