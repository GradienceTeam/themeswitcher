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

        const dayChooser = this._builder.get_object('day_chooser');
        const dayBackgroundPreview = this._builder.get_object('day_background_preview');
        const updateDayChooserUri = () => {
            dayChooser.set_uri(settings.backgrounds.day);
        };
        settings.backgrounds.connect('day-changed', () => updateDayChooserUri());
        dayChooser.connect('update-preview', () => {
            const file = dayChooser.get_preview_filename();
            const allowedContentTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/xml'];
            if (allowedContentTypes.includes(Gio.content_type_guess(file, null)[0])) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(file, 256, 256);
                dayBackgroundPreview.set_from_pixbuf(pixbuf);
            }
        });
        dayChooser.connect('file-set', () => {
            settings.backgrounds.day = dayChooser.get_uri();
        });
        updateDayChooserUri();

        const dayClearButton = this._builder.get_object('day_clear_button');
        dayClearButton.connect('clicked', () => {
            settings.backgrounds.day = '';
        });
        const updateDayClearButtonSensitivity = () => {
            dayClearButton.sensitive = !!settings.backgrounds.day;
        };
        settings.backgrounds.connect('day-changed', () => updateDayClearButtonSensitivity());
        updateDayClearButtonSensitivity();

        const nightChooser = this._builder.get_object('night_chooser');
        const nightBackgroundPreview = this._builder.get_object('night_background_preview');
        const updateNightChooserUri = () => {
            nightChooser.set_uri(settings.backgrounds.night);
        };
        settings.backgrounds.connect('night-changed', () => updateNightChooserUri());
        nightChooser.connect('update-preview', () => {
            const file = nightChooser.get_preview_filename();
            const allowedContentTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/xml'];
            if (allowedContentTypes.includes(Gio.content_type_guess(file, null)[0])) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(file, 256, 256);
                nightBackgroundPreview.set_from_pixbuf(pixbuf);
            }
        });
        nightChooser.connect('file-set', () => {
            settings.backgrounds.night = nightChooser.get_uri();
        });
        updateNightChooserUri();

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
