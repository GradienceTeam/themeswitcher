// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GdkPixbuf, Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


var BackgroundsPreferences = class {
    constructor(settings) {
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(GLib.build_filenamev([Me.path, 'preferences', 'ui', 'backgrounds.ui']));

        this.widget = this._builder.get_object('backgrounds');
        this.name = 'backgrounds';
        this.title = _('Backgrounds');

        this._connectSettings(settings);
    }

    _connectSettings(settings) {
        const enabledSwitch = this._builder.get_object('enabled_switch');
        settings.backgrounds.settings.bind(
            'enabled',
            enabledSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const choosers = this._builder.get_object('choosers');
        settings.backgrounds.settings.bind(
            'enabled',
            choosers,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const dayChooserButton = this._builder.get_object('day_chooser_button');
        const dayChooser = this._builder.get_object('day_chooser');
        const updateDayChooserButtonLabel = () => {
            dayChooserButton.set_label(settings.backgrounds.day ? GLib.filename_display_basename(settings.backgrounds.day) : _('Choose...'));
        };
        settings.backgrounds.connect('day-changed', () => updateDayChooserButtonLabel());
        dayChooser.connect('response', (_fileChooser, responseId) => {
            if (responseId !== Gtk.ResponseType.ACCEPT)
                return;
            settings.backgrounds.day = dayChooser.get_file().get_uri();
        });
        dayChooserButton.connect('clicked', () => {
            dayChooser.set_transient_for(dayChooserButton.get_root());
            dayChooser.show();
        });
        updateDayChooserButtonLabel();

        const dayClearButton = this._builder.get_object('day_clear_button');
        dayClearButton.connect('clicked', () => {
            settings.backgrounds.day = '';
        });
        const updateDayClearButtonSensitivity = () => {
            dayClearButton.sensitive = !!settings.backgrounds.day;
        };
        settings.backgrounds.connect('day-changed', () => updateDayClearButtonSensitivity());
        updateDayClearButtonSensitivity();

        const nightChooserButton = this._builder.get_object('night_chooser_button');
        const nightChooser = this._builder.get_object('night_chooser');
        const updateNightChooserButtonLabel = () => {
            nightChooserButton.set_label(settings.backgrounds.night ? GLib.filename_display_basename(settings.backgrounds.night) : _('Choose...'));
        };
        settings.backgrounds.connect('night-changed', () => updateNightChooserButtonLabel());
        nightChooser.connect('response', (_fileChooser, responseId) => {
            if (responseId !== Gtk.ResponseType.ACCEPT)
                return;
            settings.backgrounds.night = nightChooser.get_file().get_uri();
        });
        nightChooserButton.connect('clicked', () => {
            nightChooser.set_transient_for(nightChooserButton.get_root());
            nightChooser.show();
        });
        updateNightChooserButtonLabel();

        const nightClearButton = this._builder.get_object('night_clear_button');
        nightClearButton.connect('clicked', () => {
            settings.backgrounds.night = '';
        });
        const updateNightClearButtonSensitivity = () => {
            nightClearButton.sensitive = !!settings.backgrounds.night;
        };
        settings.backgrounds.connect('night-changed', () => updateNightClearButtonSensitivity());
        updateNightClearButtonSensitivity();
    }
};
