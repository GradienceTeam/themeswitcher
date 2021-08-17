// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var CommandsPreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'commands.ui']));

        this.widget = this._builder.get_object('commands');
        this.name = 'commands';
        this.title = _('Commands');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.commands.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const entries = this._builder.get_object('entries');
        settings.commands.settings.bind(
            'enabled',
            entries,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunriseEntry = this._builder.get_object('sunrise_entry');
        settings.commands.settings.bind(
            'sunrise',
            sunriseEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunriseClearButton = this._builder.get_object('sunrise_clear_button');
        sunriseClearButton.connect('clicked', () => {
            settings.commands.sunrise = '';
        });
        const updateSunriseClearButtonSensitivity = () => {
            sunriseClearButton.sensitive = !!settings.commands.sunrise;
        };
        settings.commands.connect('sunrise-changed', () => updateSunriseClearButtonSensitivity());
        updateSunriseClearButtonSensitivity();

        const sunsetEntry = this._builder.get_object('sunset_entry');
        settings.commands.settings.bind(
            'sunset',
            sunsetEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        const sunsetClearButton = this._builder.get_object('sunset_clear_button');
        sunsetClearButton.connect('clicked', () => {
            settings.commands.sunset = '';
        });
        const updateSunsetClearButtonSensitivity = () => {
            sunsetClearButton.sensitive = !!settings.commands.sunset;
        };
        settings.commands.connect('sunset-changed', () => updateSunsetClearButtonSensitivity());
        updateSunsetClearButtonSensitivity();
    }
};
