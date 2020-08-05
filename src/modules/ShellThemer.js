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

const { extensionUtils } = imports.misc;
const Signals = imports.signals;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, notifyError, getInstalledShellThemes, getShellThemeStylesheet, applyShellStylesheet } = Me.imports.utils;
const { ShellVariants } = Me.imports.modules.ShellVariants;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
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
        this._shellVariantsStatusChangedConnect = null;
        this._shellVariantChangedConnect = null;
        this._shellThemeChangedConnect = null;
        this._manualShellVariantsChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling Shell Themer...');
        try {
            this._watchStatus();
            this._saveOriginalTheme();
            if (e.settingsManager.shellVariantsEnabled) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
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
        this._resetOriginalTheme();
        this._unwatchStatus();
        logDebug('Shell Themer disabled.');
    }


    _watchStatus() {
        logDebug('Watching shell variants status...');
        this._shellVariantsStatusChangedConnect = e.settingsManager.connect('shell-variants-status-changed', this._onShellVariantsStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._shellVariantsStatusChangedConnect) {
            e.settingsManager.disconnect(this._shellVariantsStatusChangedConnect);
            this._shellVariantsStatusChangedConnect = null;
        }
        logDebug('Stopped watching shell variants status.');
    }

    _connectSettings() {
        logDebug('Connecting Shell Themer to settings...');
        this._shellVariantChangedConnect = e.settingsManager.connect('shell-variant-changed', this._onShellVariantChanged.bind(this));
        this._shellThemeChangedConnect = e.settingsManager.connect('shell-theme-changed', this._onShellThemeChanged.bind(this));
        this._manualShellVariantsChangedConnect = e.settingsManager.connect('manual-shell-variants-changed', this._onManualShellVariantsChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._shellVariantChangedConnect) {
            e.settingsManager.disconnect(this._shellVariantChangedConnect);
            this._shellVariantChangedConnect = null;
        }
        if (this._shellThemeChangedConnect) {
            e.settingsManager.disconnect(this._shellThemeChangedConnect);
            this._shellThemeChangedConnect = null;
        }
        logDebug('Disconnected Shell Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting Shell Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected Shell Themer from Timer.');
    }


    _onShellVariantsStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onShellVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setVariant(e.timer.time);
    }

    _onShellThemeChanged(_settings, _newTheme) {
        try {
            this._updateVariants();
            this._setVariant(e.timer.time);
        } catch (error) {
            notifyError(error);
        }
    }

    _onManualShellVariantsChanged(_settings, enabled) {
        this.disable();
        this.enable();
        if (enabled && e.timer.time)
            this._setVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setVariant(newTime);
    }


    _areVariantsUpToDate() {
        return e.settingsManager.shellTheme === e.settingsManager.shellVariantDay || e.settingsManager.shellTheme === e.settingsManager.shellVariantNight;
    }

    _setVariant(time) {
        logDebug(`Setting the shell ${time} variant...`);
        let shellTheme;
        switch (time) {
        case 'day':
            shellTheme = e.settingsManager.shellVariantDay;
            break;
        case 'night':
            shellTheme = e.settingsManager.shellVariantNight;
            break;
        case 'original':
            shellTheme = e.settingsManager.shellVariantOriginal;
            break;
        }
        if (e.settingsManager.useUserthemes) {
            e.settingsManager.shellTheme = shellTheme;
        } else {
            const stylesheet = getShellThemeStylesheet(shellTheme);
            applyShellStylesheet(stylesheet);
        }
    }

    _updateVariants() {
        if (!e.settingsManager.useUserthemes || e.settingsManager.manualShellVariants || this._areVariantsUpToDate())
            return;

        logDebug('Updating Shell variants...');
        const variants = ShellVariants.guessFrom(e.settingsManager.shellTheme);
        const installedThemes = getInstalledShellThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            e.settingsManager.shellVariantOriginal = variants.get('original');
            const message = _('Unable to automatically detect the day and night variants for the "%s" GNOME Shell theme. Please manually choose them in the extension\'s preferences.').format(variants.get('original'));
            throw new Error(message);
        }

        e.settingsManager.shellVariantDay = variants.get('day');
        e.settingsManager.shellVariantNight = variants.get('night');
        e.settingsManager.shellVariantOriginal = variants.get('original');
        logDebug(`New Shell variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }

    _saveOriginalTheme() {
        e.settingsManager.shellVariantOriginal = e.settingsManager.shellTheme;
    }

    _resetOriginalTheme() {
        // We don't reset the theme when locking the session to prevent
        // flicker on unlocking
        if (!main.screenShield.locked) {
            logDebug('Resetting to the user\'s original Shell theme...');
            this._setVariant('original');
        }
    }

};
Signals.addSignalMethods(ShellThemer.prototype);
