// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Adw, Gio, GLib, GObject } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();


var BackgroundsPage = GObject.registerClass({
    GTypeName: 'BackgroundsPage',
    Template: `file://${GLib.build_filenamev([Me.path, 'preferences', 'ui', 'BackgroundsPage.ui'])}`,
    InternalChildren: [
        'day_button',
        'night_button',
    ],
}, class BackgroundsPage extends Adw.PreferencesPage {
    _init(props = {}) {
        super._init(props);
        const settings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });

        settings.bind('picture-uri', this._day_button, 'path', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('picture-uri-dark', this._night_button, 'path', Gio.SettingsBindFlags.DEFAULT);
    }
});
