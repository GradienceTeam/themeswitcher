// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const e = Me.imports.extension;
const utils = Me.imports.utils;

const { Time } = Me.imports.enums.Time;


/**
 * The GTK Themer is responsible for changing the GTK theme according to the
 * time.
 *
 * When the user changes its GTK theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the GTK variants in the extension's preferences.
 */
var GtkThemer = class {
    constructor() {
        this._gtkVariantsSettings = extensionUtils.getSettings(utils.getSettingsSchema('gtk-variants'));
        this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        console.debug('Enabling GTK Themer...');
        this._watchStatus();
        if (this._gtkVariantsSettings.get_boolean('enabled')) {
            this._connectSettings();
            this._connectTimer();
            this._updateSystemGtkTheme();
        }
        console.debug('GTK Themer enabled.');
    }

    disable() {
        console.debug('Disabling GTK Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        console.debug('GTK Themer disabled.');
    }


    _watchStatus() {
        console.debug('Watching GTK variants status...');
        this._statusConnection = this._gtkVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._gtkVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        console.debug('Stopped watching GTK variants status.');
    }

    _connectSettings() {
        console.debug('Connecting GTK Themer to settings...');
        this._settingsConnections.push({
            settings: this._gtkVariantsSettings,
            id: this._gtkVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._gtkVariantsSettings,
            id: this._gtkVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._interfaceSettings,
            id: this._interfaceSettings.connect('changed::gtk-theme', this._onSystemGtkThemeChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        console.debug('Disconnected GTK Themer from settings.');
    }

    _connectTimer() {
        console.debug('Connecting GTK Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        console.debug('Disconnected GTK Themer from Timer.');
    }


    _onStatusChanged() {
        console.debug(`GTK variants switching has been ${this._gtkVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        console.debug(`Day GTK variant changed to '${this._gtkVariantsSettings.get_string('day')}'.`);
        this._updateSystemGtkTheme();
    }

    _onNightVariantChanged() {
        console.debug(`Night GTK variant changed to '${this._gtkVariantsSettings.get_string('night')}'.`);
        this._updateSystemGtkTheme();
    }

    _onSystemGtkThemeChanged() {
        console.debug(`System GTK theme changed to '${this._interfaceSettings.get_string('gtk-theme')}'.`);
        this._updateCurrentVariant();
    }

    _onTimeChanged() {
        this._updateSystemGtkTheme();
    }


    _updateCurrentVariant() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        this._gtkVariantsSettings.set_string(e.timer.time, this._interfaceSettings.get_string('gtk-theme'));
    }

    _updateSystemGtkTheme() {
        if (e.timer.time === Time.UNKNOWN)
            return;
        console.debug(`Setting the ${e.timer.time} GTK variant...`);
        this._interfaceSettings.set_string('gtk-theme', this._gtkVariantsSettings.get_string(e.timer.time));
    }
};
