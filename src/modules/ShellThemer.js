// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const utils = Me.imports.utils;
const { logDebug, notifyError } = Me.imports.utils;
const { ShellVariants } = Me.imports.modules.ShellVariants;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

/**
 * The Shell Themer is responsible for changing the GTK theme according to the
 * time. It will use the User Themes extension to do so if it is enabled.
 *
 * When the user changes its shell theme (for example via GNOME Tweaks), it will
 * try to automatically guess the day and night variants for this theme. It
 * will warn the user if it is unable to guess.
 *
 * In manual mode, it will not attempt to update the variants. The user can
 * change the shell variants in the extension's preferences.
 */
var ShellThemer = class {
    constructor() {
        this._shellVariantsSettings = extensionUtils.getSettings(utils.getSettingsSchema('shell-variants'));
        this._userthemesSettings = utils.getUserthemesSettings();
        this._settingsConnections = [];
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        logDebug('Enabling Shell Themer...');
        try {
            this._watchStatus();
            if (this._shellVariantsSettings.get_boolean('enabled')) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
                this._updateSystemShellTheme();
            }
        } catch (error) {
            notifyError(error);
        }
        logDebug('Shell Themer enabled.');
    }

    disable() {
        logDebug('Disabling Shell Themer...');
        this._disconnectTimer();
        this._disconnectSettings();
        this._unwatchStatus();
        logDebug('Shell Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching shell variants status...');
        this._statusConnection = this._shellVariantsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._shellVariantsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        logDebug('Stopped watching shell variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Shell Themer to settings...');
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::day', this._onDayVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::night', this._onNightVariantChanged.bind(this)),
        });
        this._settingsConnections.push({
            settings: this._shellVariantsSettings,
            id: this._shellVariantsSettings.connect('changed::manual', this._onManualChanged.bind(this)),
        });
        if (this._userthemesSettings) {
            this._settingsConnections.push({
                settings: this._userthemesSettings,
                id: this._userthemesSettings.connect('changed::name', this._onSystemShellThemeChanged.bind(this)),
            });
        }
    }

    _disconnectSettings() {
        this._settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this._settingsConnections = [];
        logDebug('Disconnected Shell Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Shell Themer to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        logDebug('Disconnected Shell Themer from Timer.');
    }


    _onStatusChanged() {
        logDebug(`Shell variants switching has been ${this._shellVariantsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onDayVariantChanged() {
        logDebug(`Day Shell variant changed to '${this._shellVariantsSettings.get_string('day')}'.`);
        this._updateSystemShellTheme();
    }

    _onNightVariantChanged() {
        logDebug(`Night Shell variant changed to '${this._shellVariantsSettings.get_string('night')}'.`);
        this._updateSystemShellTheme();
    }

    _onSystemShellThemeChanged(_settings, _newTheme) {
        if (!this._userthemesSettings)
            return;
        logDebug(`System Shell theme changed to '${this._userthemesSettings.get_string('name')}'.`);
        try {
            this._updateVariants();
            this._updateCurrentVariant();
            this._updateSystemShellTheme();
        } catch (error) {
            notifyError(error);
        }
    }

    _onManualChanged() {
        logDebug(`Manual Shell variants choice has been ${this._shellVariantsSettings.get_boolean('manual') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onTimeChanged() {
        this._updateSystemShellTheme();
    }


    _areVariantsUpToDate() {
        if (!this._userthemesSettings)
            return true;
        return (
            this._userthemesSettings.get_string('name') === this._shellVariantsSettings.get_string('day') ||
            this._userthemesSettings.get_string('name') === this._shellVariantsSettings.get_string('night')
        );
    }

    _updateCurrentVariant() {
        if (this._userthemesSettings && this._shellVariantsSettings.get_boolean('manual') && e.timer.time)
            this._shellVariantsSettings.set_string(e.timer.time, this._userthemesSettings.get_string('name'));
    }

    _updateSystemShellTheme() {
        if (!e.timer.time)
            return;
        logDebug(`Setting the ${e.timer.time} Shell variant...`);
        const shellTheme = this._shellVariantsSettings.get_string(e.timer.time);
        if (this._userthemesSettings) {
            this._userthemesSettings.set_string('name', shellTheme);
        } else {
            const stylesheet = utils.getShellThemeStylesheet(shellTheme);
            utils.applyShellStylesheet(stylesheet);
        }
    }

    _updateVariants() {
        if (!this._userthemesSettings || this._shellVariantsSettings.get_boolean('manual') || this._areVariantsUpToDate())
            return;

        logDebug('Updating Shell variants...');
        const originalTheme = this._userthemesSettings.get_string('name');
        const variants = ShellVariants.guessFrom(originalTheme);
        const installedThemes = utils.getInstalledShellThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GNOME Shell theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        this._shellVariantsSettings.set_string('day', variants.get('day'));
        this._shellVariantsSettings.set_string('night', variants.get('night'));
        logDebug(`New Shell variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }
};
