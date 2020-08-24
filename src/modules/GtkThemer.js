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
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, notifyError, getInstalledGtkThemes } = Me.imports.utils;
const { GtkVariants } = Me.imports.modules.GtkVariants;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
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
        this._gtkVariantsStatusChangedConnect = null;
        this._gtkVariantChangedConnect = null;
        this._gtkThemeChangedConnect = null;
        this._manualGtkVariantsChangedConnect = null;
        this._timeChangedConnect = null;
    }

    enable() {
        logDebug('Enabling GTK Themer...');
        try {
            this._watchStatus();
            if (e.settingsManager.gtkVariantsEnabled) {
                this._connectSettings();
                this._updateVariants();
                this._connectTimer();
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
        this._gtkVariantsStatusChangedConnect = e.settingsManager.connect('gtk-variants-status-changed', this._onGtkVariantsStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._gtkVariantsStatusChangedConnect) {
            e.settingsManager.disconnect(this._gtkVariantsStatusChangedConnect);
            this._gtkVariantsStatusChangedConnect = null;
        }
        logDebug('Stopped watching GTK variants status.');
    }

    _connectSettings() {
        logDebug('Connecting GTK Themer to settings...');
        this._gtkVariantChangedConnect = e.settingsManager.connect('gtk-variant-changed', this._onGtkVariantChanged.bind(this));
        this._gtkThemeChangedConnect = e.settingsManager.connect('gtk-theme-changed', this._onGtkThemeChanged.bind(this));
        this._manualGtkVariantsChangedConnect = e.settingsManager.connect('manual-gtk-variants-changed', this._onManualGtkVariantsChanged.bind(this));
    }

    _disconnectSettings() {
        if (this._gtkVariantChangedConnect) {
            e.settingsManager.disconnect(this._gtkVariantChangedConnect);
            this._gtkVariantChangedConnect = null;
        }
        if (this._gtkThemeChangedConnect) {
            e.settingsManager.disconnect(this._gtkThemeChangedConnect);
            this._gtkThemeChangedConnect = null;
        }
        logDebug('Disconnected GTK Themer from settings.');
    }

    _connectTimer() {
        logDebug('Connecting GTK Themer to Timer...');
        this._timeChangedConnect = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timeChangedConnect) {
            e.timer.disconnect(this._timeChangedConnect);
            this._timeChangedConnect = null;
        }
        logDebug('Disconnected GTK Themer from Timer.');
    }


    _onGtkVariantsStatusChanged(_settings, _enabled) {
        this.disable();
        this.enable();
    }

    _onGtkVariantChanged(_settings, changedVariantTime) {
        if (changedVariantTime === e.timer.time)
            this._setVariant(changedVariantTime);
    }

    _onGtkThemeChanged(_settings, _newTheme) {
        try {
            this._updateVariants();
            this._setVariant(e.timer.time);
        } catch (error) {
            notifyError(error);
        }
    }

    _onManualGtkVariantsChanged(_settings, enabled) {
        this.disable();
        this.enable();
        if (enabled)
            this._setVariant(e.timer.time);
    }

    _onTimeChanged(_timer, newTime) {
        this._setVariant(newTime);
    }


    _areVariantsUpToDate() {
        return e.settingsManager.gtkTheme === e.settingsManager.gtkVariantDay || e.settingsManager.gtkTheme === e.settingsManager.gtkVariantNight;
    }

    _setVariant(time) {
        if (!time)
            return;
        logDebug(`Setting the GTK ${time} variant...`);
        e.settingsManager.gtkTheme = time === 'day' ? e.settingsManager.gtkVariantDay : e.settingsManager.gtkVariantNight;
    }

    _updateVariants() {
        if (e.settingsManager.manualGtkVariants || this._areVariantsUpToDate())
            return;

        logDebug('Updating GTK variants...');
        const originalTheme = e.settingsManager.gtkTheme;
        const variants = GtkVariants.guessFrom(originalTheme);
        const installedThemes = getInstalledGtkThemes();

        if (!installedThemes.has(variants.get('day')) || !installedThemes.has(variants.get('night'))) {
            const message = _('Unable to automatically detect the day and night variants for the "%s" GTK theme. Please manually choose them in the extension\'s preferences.').format(originalTheme);
            throw new Error(message);
        }

        e.settingsManager.gtkVariantDay = variants.get('day');
        e.settingsManager.gtkVariantNight = variants.get('night');
        logDebug(`New GTK variants. { day: '${variants.get('day')}'; night: '${variants.get('night')}' }`);
    }

};
