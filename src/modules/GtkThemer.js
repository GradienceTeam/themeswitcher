// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const utils = Me.imports.utils;
const { logDebug, notifyError } = utils;
const { GtkVariants } = Me.imports.modules.GtkVariants;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;


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
        logDebug('Enabling GTK Themer...');
        try {
            this._watchStatus();
            if (this._gtkVariantsSettings.get_boolean('enabled')) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
                this._updateSystemGtkTheme();
            }
        } catch (error) {
            notifyError(error);
        }
        logDebug('GTK Themer enabled.');
    }

    disable() {
        logDebug('Disabling GTK Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('GTK Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching GTK variants status...');
        this._statusConnection = this._gtkVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._gtkVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        logDebug('Stopped watching GTK variants status.');
    }

    _connectSettings() {
        logDebug('Connecting GTK Themer to settings...');
        this._settingsConnections.push({
            settings: this._gtkVariantsSettings,
            id: this._gtkVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._gtkVariantsSettings,
            id: this._gtkVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._gtkVariantsSettings,
            id: this._gtkVariantsSettings.connect('changed::manual', this._onManualChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._interfaceSettings,
            id: this._interfaceSettings.connect('changed::gtk-theme', this._onSystemGtkThemeChanged.bind(this)),
        });
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        logDebug('Disconnected GTK Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting GTK Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        logDebug('Disconnected GTK Themer from Timer.');
    }


    _onStatusChanged() {
        logDebug(`GTK variants switching has been ${this._gtkVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        logDebug(`Day GTK variant changed to '${this._gtkVariantsSettings.get_string('day')}'.`);
        this._updateSystemGtkTheme();
    }

    _onNightVariantChanged() {
        logDebug(`Night GTK variant changed to '${this._gtkVariantsSettings.get_string('night')}'.`);
        this._updateSystemGtkTheme();
    }

    _onSystemGtkThemeChanged() {
        logDebug(`System GTK theme changed to '${this._interfaceSettings.get_string('gtk-theme')}'.`);
        try {
            this._updateVariants();
            this._updateCurrentVariant();
            this._updateSystemGtkTheme();
        } catch (error) {
            notifyError(error);
        }
    }

    _onManualChanged() {
        logDebug(`Manual GTK variants choice has been ${this._gtkVariantsSettings.get_boolean('manual') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onTimeChanged() {
        this._updateSystemGtkTheme();
    }


    _areVariantsUpToDate() {
        return (
            this._interfaceSettings.get_string('gtk-theme') === this._gtkVariantsSettings.get_string('day') ||
            this._interfaceSettings.get_string('gtk-theme') === this._gtkVariantsSettings.get_string('night')
        );
    }

    _updateCurrentVariant() {
        if (this._gtkVariantsSettings.get_boolean('manual') && e.timer.time)
            this._gtkVariantsSettings.set_string(e.timer.time, this._interfaceSettings.get_string('gtk-theme'));
    }

    _updateSystemGtkTheme() {
        if (!e.timer.time)
            return;
        logDebug(`Setting the ${e.timer.time} GTK variant...`);
        this._interfaceSettings.set_string('gtk-theme', this._gtkVariantsSettings.get_string(e.timer.time));
    }

    _updateVariants() {
        if (this._gtkVariantsSettings.get_boolean('manual') || this._areVariantsUpToDate())
            return;

        logDebug('Updating GTK variants...');
        const originalTheme = this._interfaceSettings.get_string('gtk-theme');
        const variants = GtkVariants.guessFrom(originalTheme);
        const installedThemes = utils.getInstalledGtkThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GTK theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        this._gtkVariantsSettings.set_string('day', variants.get('day'));
        this._gtkVariantsSettings.set_string('night', variants.get('night'));
        logDebug(`New GTK variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }
};
