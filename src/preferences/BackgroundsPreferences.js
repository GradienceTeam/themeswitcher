// SPDX-FileCopyrightText: 2021, 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var BackgroundsPreferences = GObject.registerClass({
    GTypeName: 'BackgroundsPreferences',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'BackgroundsPreferences.ui'])}`,
    InternalChildren: [
        'day_button',
        'night_button',
    ],
    Properties: {
        settings: GObject.ParamSpec.object(
            'settings',
            'Settings',
            'Backgrounds GSettings',
            GObject.ParamFlags.READWRITE,
            Gio.Settings.$gtype
        ),
    },
}, class BackgroundsPreferences extends Gtk.Box {
    _init(props = {}) {
        super._init(props);
        this.settings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });

        this.settings.bind(
            'picture-uri',
            this._day_button,
            'path',
            Gio.SettingsBindFlags.DEFAULT
        );

        this.settings.bind(
            'picture-uri-dark',
            this._night_button,
            'path',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});
