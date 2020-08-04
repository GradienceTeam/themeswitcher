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

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const compat = Me.imports.compat;
const { logDebug, getUserthemesExtension, getUserthemesSettings } = Me.imports.utils;


/**
 * The Settings Manager centralizes all the different settings the extension
 * needs. It handles getting and settings values as well as signaling any
 * changes.
 */
var SettingsManager = class {

    constructor() {
        logDebug('Initializing settings...');
        this._extensionsSettings = compat.getExtensionSettings();
        this._colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        this._locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
        this._interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this._backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
        this._userthemesSettings = getUserthemesSettings();
        logDebug('Settings initialized.');
    }

    enable() {
        logDebug('Connecting settings signals...');
        this._gtkVariantsStatusChangedConnect = this._extensionsSettings.connect('changed::gtk-variants-enabled', this._onGtkVariantsStatusChanged.bind(this));
        this._gtkVariantDayChangedConnect = this._extensionsSettings.connect('changed::gtk-variant-day', this._onGtkVariantDayChanged.bind(this));
        this._gtkVariantNightChangedConnect = this._extensionsSettings.connect('changed::gtk-variant-night', this._onGtkVariantNightChanged.bind(this));
        this._gtkVariantOriginalChangedConnect = this._extensionsSettings.connect('changed::gtk-variant-original', this._onGtkVariantOriginalChanged.bind(this));
        this._shellVariantsStatusChangedConnect = this._extensionsSettings.connect('changed::shell-variants-enabled', this._onShellVariantsStatusChanged.bind(this));
        this._shellVariantDayChangedConnect = this._extensionsSettings.connect('changed::shell-variant-day', this._onShellVariantDayChanged.bind(this));
        this._shellVariantNightChangedConnect = this._extensionsSettings.connect('changed::shell-variant-night', this._onShellVariantNightChanged.bind(this));
        this._shellVariantOriginalChangedConnect = this._extensionsSettings.connect('changed::shell-variant-original', this._onShellVariantOriginalChanged.bind(this));
        this._iconVariantsStatusConnect = this._extensionsSettings.connect('changed::icon-variants-enabled', this._onIconVariantsStatusChanged.bind(this));
        this._iconVariantDayChangedConnect = this._extensionsSettings.connect('changed::icon-variant-day', this._onIconVariantDayChanged.bind(this));
        this._iconVariantNightChangedConnect = this._extensionsSettings.connect('changed::icon-variant-night', this._onIconVariantNightChanged.bind(this));
        this._iconVariantOriginalChangedConnect = this._extensionsSettings.connect('changed::icon-variant-original', this._onIconVariantOriginalChanged.bind(this));
        this._cursorVariantsStatusConnect = this._extensionsSettings.connect('changed::cursor-variants-enabled', this._onCursorVariantsStatusChanged.bind(this));
        this._cursorVariantDayChangedConnect = this._extensionsSettings.connect('changed::cursor-variant-day', this._onCursorVariantDayChanged.bind(this));
        this._cursorVariantNightChangedConnect = this._extensionsSettings.connect('changed::cursor-variant-night', this._onCursorVariantNightChanged.bind(this));
        this._cursorVariantOriginalChangedConnect = this._extensionsSettings.connect('changed::cursor-variant-original', this._onCursorVariantOriginalChanged.bind(this));
        this._timeSourceChangedConnect = this._extensionsSettings.connect('changed::time-source', this._onTimeSourceChanged.bind(this));
        this._manualTimeSourceChangedConnect = this._extensionsSettings.connect('changed::manual-time-source', this._onManualTimeSourceChanged.bind(this));
        this._ondemandKeybindingChangedConnect = this._extensionsSettings.connect('changed::nightthemeswitcher-ondemand-keybinding', this._onOndemandKeybindingChanged.bind(this));
        this._commandsStatusConnect = this._extensionsSettings.connect('changed::commands-enabled', this._onCommandsStatusChanged.bind(this));
        this._backgroundsStatusConnect = this._extensionsSettings.connect('changed::backgrounds-enabled', this._onBackgroundsStatusChanged.bind(this));
        this._backgroundDayChangedConnect = this._extensionsSettings.connect('changed::background-day', this._onBackgroundDayChanged.bind(this));
        this._backgroundNightChangedConnect = this._extensionsSettings.connect('changed::background-night', this._onBackgroundNightChanged.bind(this));
        this._nightlightStatusConnect = this._colorSettings.connect('changed::night-light-enabled', this._onNightlightStatusChanged.bind(this));
        this._locationStatusConnect = this._locationSettings.connect('changed::enabled', this._onLocationStatusChanged.bind(this));
        this._gtkThemeChangedConnect = this._interfaceSettings.connect('changed::gtk-theme', this._onGtkThemeChanged.bind(this));
        this._iconThemeChangedConnect = this._interfaceSettings.connect('changed::icon-theme', this._onIconThemeChanged.bind(this));
        this._cursorThemeChangedConnect = this._interfaceSettings.connect('changed::cursor-theme', this._onCursorThemeChanged.bind(this));
        this._backgroundChangedConnect = this._backgroundSettings.connect('changed::picture-uri', this._onBackgroundChanged.bind(this));
        if (this._userthemesSettings)
            this._shell_theme_changed_connect = this._userthemesSettings.connect('changed::name', this._onShellThemeChanged.bind(this));
        logDebug('Settings signals connected.');
    }

    disable() {
        logDebug('Disconnecting settings signals...');
        this._extensionsSettings.disconnect(this._gtkVariantsStatusChangedConnect);
        this._extensionsSettings.disconnect(this._gtkVariantDayChangedConnect);
        this._extensionsSettings.disconnect(this._gtkVariantNightChangedConnect);
        this._extensionsSettings.disconnect(this._gtkVariantOriginalChangedConnect);
        this._extensionsSettings.disconnect(this._shellVariantsStatusChangedConnect);
        this._extensionsSettings.disconnect(this._shellVariantDayChangedConnect);
        this._extensionsSettings.disconnect(this._shellVariantNightChangedConnect);
        this._extensionsSettings.disconnect(this._shellVariantOriginalChangedConnect);
        this._extensionsSettings.disconnect(this._iconVariantsStatusConnect);
        this._extensionsSettings.disconnect(this._iconVariantDayChangedConnect);
        this._extensionsSettings.disconnect(this._iconVariantNightChangedConnect);
        this._extensionsSettings.disconnect(this._iconVariantOriginalChangedConnect);
        this._extensionsSettings.disconnect(this._cursorVariantsStatusConnect);
        this._extensionsSettings.disconnect(this._cursorVariantDayChangedConnect);
        this._extensionsSettings.disconnect(this._cursorVariantNightChangedConnect);
        this._extensionsSettings.disconnect(this._cursorVariantOriginalChangedConnect);
        this._extensionsSettings.disconnect(this._timeSourceChangedConnect);
        this._extensionsSettings.disconnect(this._manualTimeSourceChangedConnect);
        this._extensionsSettings.disconnect(this._ondemandKeybindingChangedConnect);
        this._extensionsSettings.disconnect(this._commandsStatusConnect);
        this._extensionsSettings.disconnect(this._backgroundsStatusConnect);
        this._extensionsSettings.disconnect(this._backgroundDayChangedConnect);
        this._extensionsSettings.disconnect(this._backgroundNightChangedConnect);
        this._colorSettings.disconnect(this._nightlightStatusConnect);
        this._locationSettings.disconnect(this._locationStatusConnect);
        this._interfaceSettings.disconnect(this._gtkThemeChangedConnect);
        this._interfaceSettings.disconnect(this._iconThemeChangedConnect);
        this._interfaceSettings.disconnect(this._cursorThemeChangedConnect);
        this._backgroundSettings.disconnect(this._backgroundChangedConnect);
        if (this._userthemesSettings)
            this._userthemesSettings.disconnect(this._shell_theme_changed_connect);
        logDebug('Settings signals disconnected.');
    }

    /**
     * SETTERS AND GETTERS
     */

    /* GTK variants settings */

    get gtkVariantsEnabled() {
        return this._extensionsSettings.get_boolean('gtk-variants-enabled');
    }

    get gtkVariantDay() {
        return this._extensionsSettings.get_string('gtk-variant-day');
    }

    set gtkVariantDay(value) {
        if (value !== this.gtkVariantDay) {
            this._extensionsSettings.set_string('gtk-variant-day', value);
            logDebug(`The GTK day variant has been set to '${value}'.`);
        }
    }

    get gtkVariantNight() {
        return this._extensionsSettings.get_string('gtk-variant-night');
    }

    set gtkVariantNight(value) {
        if (value !== this.gtkVariantNight) {
            this._extensionsSettings.set_string('gtk-variant-night', value);
            logDebug(`The GTK night variant has been set to '${value}'.`);
        }
    }

    get gtkVariantOriginal() {
        return this._extensionsSettings.get_string('gtk-variant-original');
    }

    set gtkVariantOriginal(value) {
        if (value !== this.gtkVariantOriginal) {
            this._extensionsSettings.set_string('gtk-variant-original', value);
            logDebug(`The GTK original variant has been set to '${value}'.`);
        }
    }

    get manualGtkVariants() {
        return this._extensionsSettings.get_boolean('manual-gtk-variants');
    }


    /* Shell variants settings */

    get shellVariantsEnabled() {
        return this._extensionsSettings.get_boolean('shell-variants-enabled');
    }

    get shellVariantDay() {
        return this._extensionsSettings.get_string('shell-variant-day');
    }

    set shellVariantDay(value) {
        if (value !== this.shellVariantDay) {
            this._extensionsSettings.set_string('shell-variant-day', value);
            logDebug(`The shell day variant has been set to '${value}'.`);
        }
    }

    get shellVariantNight() {
        return this._extensionsSettings.get_string('shell-variant-night');
    }

    set shellVariantNight(value) {
        if (value !== this.shellVariantNight) {
            this._extensionsSettings.set_string('shell-variant-night', value);
            logDebug(`The shell night variant has been set to '${value}'.`);
        }
    }

    get shellVariantOriginal() {
        return this._extensionsSettings.get_string('shell-variant-original');
    }

    set shellVariantOriginal(value) {
        if (value !== this.shellVariantOriginal) {
            this._extensionsSettings.set_string('shell-variant-original', value);
            logDebug(`The shell original variant has been set to '${value}'.`);
        }
    }

    get manualShellVariants() {
        return this._extensionsSettings.get_boolean('manual-shell-variants');
    }

    /* Cursor variants settings */

    get cursorVariantsEnabled() {
        return this._extensionsSettings.get_boolean('cursor-variants-enabled');
    }

    get cursorVariantDay() {
        return this._extensionsSettings.get_string('cursor-variant-day') || this.cursorTheme;
    }

    set cursorVariantDay(value) {
        if (value !== this.cursorVariantDay) {
            this._extensionsSettings.set_string('cursor-variant-day', value);
            logDebug(`The cursor day variant has been set to '${value}'.`);
        }
    }

    get cursorVariantNight() {
        return this._extensionsSettings.get_string('cursor-variant-night') || this.cursorTheme;
    }

    set cursorVariantNight(value) {
        if (value !== this.cursorVariantNight) {
            this._extensionsSettings.set_string('cursor-variant-night', value);
            logDebug(`The cursor night variant has been set to '${value}'.`);
        }
    }

    get cursorVariantOriginal() {
        return this._extensionsSettings.get_string('cursor-variant-original');
    }

    set cursorVariantOriginal(value) {
        if (value !== this.cursorVariantOriginal) {
            this._extensionsSettings.set_string('cursor-variant-original', value);
            logDebug(`The cursor original variant has been set to '${value}'.`);
        }
    }

    /* Icon variants settings */

    get iconVariantsEnabled() {
        return this._extensionsSettings.get_boolean('icon-variants-enabled');
    }

    get iconVariantDay() {
        return this._extensionsSettings.get_string('icon-variant-day') || this.iconTheme;
    }

    set iconVariantDay(value) {
        if (value !== this.iconVariantDay) {
            this._extensionsSettings.set_string('icon-variant-day', value);
            logDebug(`The icon day variant has been set to '${value}'.`);
        }
    }

    get iconVariantNight() {
        return this._extensionsSettings.get_string('icon-variant-night') || this.iconTheme;
    }

    set iconVariantNight(value) {
        if (value !== this.iconVariantNight) {
            this._extensionsSettings.set_string('icon-variant-night', value);
            logDebug(`The icon night variant has been set to '${value}'.`);
        }
    }

    get iconVariantOriginal() {
        return this._extensionsSettings.get_string('icon-variant-original');
    }

    set iconVariantOriginal(value) {
        if (value !== this.iconVariantOriginal) {
            this._extensionsSettings.set_string('icon-variant-original', value);
            logDebug(`The icon original variant has been set to '${value}'.`);
        }
    }


    /* Time source settings */

    get timeSource() {
        return this._extensionsSettings.get_string('time-source');
    }

    set timeSource(value) {
        if (value !== this.timeSource) {
            this._extensionsSettings.set_string('time-source', value);
            logDebug(`The time source has been set to ${value}.`);
        }
    }

    get manualTimeSource() {
        return this._extensionsSettings.get_boolean('manual-time-source');
    }

    get ondemandTime() {
        return this._extensionsSettings.get_string('ondemand-time');
    }

    set ondemandTime(value) {
        if (value !== this.ondemandTime) {
            this._extensionsSettings.set_string('ondemand-time', value);
            logDebug(`The on-demand time has been set to ${value}.`);
        }
    }

    get ondemandKeybinding() {
        return this._extensionsSettings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
    }

    get scheduleSunrise() {
        return this._extensionsSettings.get_double('schedule-sunrise');
    }

    get scheduleSunset() {
        return this._extensionsSettings.get_double('schedule-sunset');
    }


    /* Commands settings */

    get commandsEnabled() {
        return this._extensionsSettings.get_boolean('commands-enabled');
    }

    get commandSunrise() {
        return this._extensionsSettings.get_string('command-sunrise');
    }

    get commandSunset() {
        return this._extensionsSettings.get_string('command-sunset');
    }


    /* Background settings */

    get backgroundsEnabled() {
        return this._extensionsSettings.get_boolean('backgrounds-enabled');
    }

    get backgroundDay() {
        return this._extensionsSettings.get_string('background-day') || this.background;
    }

    set backgroundDay(value) {
        this._extensionsSettings.set_string('background-day', value);
    }

    get backgroundNight() {
        return this._extensionsSettings.get_string('background-night') || this.background;
    }

    set backgroundNight(value) {
        this._extensionsSettings.set_string('background-night', value);
    }


    /* Night Light settings */

    get nightlightEnabled() {
        return this._colorSettings.get_boolean('night-light-enabled');
    }


    /* Location settings */

    get locationEnabled() {
        return this._locationSettings.get_boolean('enabled');
    }


    /* GTK theme settings */

    get gtkTheme() {
        return this._interfaceSettings.get_string('gtk-theme');
    }

    set gtkTheme(value) {
        if (value !== this.gtkTheme) {
            this._interfaceSettings.set_string('gtk-theme', value);
            logDebug(`GTK theme has been set to '${value}'.`);
        }
    }

    /* Shell theme settings */

    get shellTheme() {
        if (this._userthemesSettings)
            return this._userthemesSettings.get_string('name');
        else
            return '';
    }

    set shellTheme(value) {
        if (this._userthemesSettings && value !== this.shellTheme)
            this._userthemesSettings.set_string('name', value);
    }

    get useUserthemes() {
        const extension = getUserthemesExtension();
        return extension && extension.state === 1;
    }


    /* Icon theme settings */

    get iconTheme() {
        return this._interfaceSettings.get_string('icon-theme');
    }

    set iconTheme(value) {
        if (value !== this.iconTheme) {
            this._interfaceSettings.set_string('icon-theme', value);
            logDebug(`Icon theme has been set to '${value}'.`);
        }
    }


    /* Cursor theme settings */

    get cursorTheme() {
        return this._interfaceSettings.get_string('cursor-theme');
    }

    set cursorTheme(value) {
        if (value !== this.cursorTheme) {
            this._interfaceSettings.set_string('cursor-theme', value);
            logDebug(`Cursor theme has been set to '${value}'.`);
        }
    }


    /* Background settings */

    get background() {
        return this._backgroundSettings.get_string('picture-uri');
    }

    set background(value) {
        if (value !== this.background)
            this._backgroundSettings.set_string('picture-uri', value);
    }


    /**
     * SIGNALS
     */

    /* GTK variants */

    _onGtkVariantsStatusChanged(_settings, _changedKey) {
        logDebug(`GTK variants have been ${this.gtkVariantsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('gtk-variants-status-changed', this.gtkVariantsEnabled);
    }

    _onGtkVariantDayChanged(_settings, _changedKey) {
        logDebug(`GTK day variant has changed to '${this.gtkVariantDay}'.`);
        this.emit('gtk-variant-changed', 'day');
    }

    _onGtkVariantNightChanged(_settings, _changedKey) {
        logDebug(`GTK night variant has changed to '${this.gtkVariantNight}'.`);
        this.emit('gtk-variant-changed', 'night');
    }

    _onGtkVariantOriginalChanged(_settings, _changedKey) {
        logDebug(`GTK original variant has changed to '${this.gtkVariantOriginal}'.`);
        this.emit('gtk-variant-changed', 'original');
    }


    /* Shell variants */

    _onShellVariantsStatusChanged(_settings, _changedKey) {
        logDebug(`Shell variants have been ${this.shellVariantsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('shell-variants-status-changed', this.shellVariantsEnabled);
    }

    _onShellVariantDayChanged(_settings, _changedKey) {
        logDebug(`Shell day variant has changed to '${this.shellVariantDay}'.`);
        this.emit('shell-variant-changed', 'day');
    }

    _onShellVariantNightChanged(_settings, _changedKey) {
        logDebug(`Shell night variant has changed to '${this.shellVariantNight}'.`);
        this.emit('shell-variant-changed', 'night');
    }

    _onShellVariantOriginalChanged(_settings, _changedKey) {
        logDebug(`Shell original variant has changed to '${this.shellVariantOriginal}'.`);
        this.emit('shell-variant-changed', 'original');
    }


    /* Cursor variants */

    _onCursorVariantsStatusChanged(_settings, _changedKey) {
        logDebug(`Cursor variants have been ${this.cursorVariantsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('cursor-variants-status-changed', this.cursorVariantsEnabled);
    }

    _onCursorVariantDayChanged(_settings, _changedKey) {
        logDebug(`Cursor day variant has changed to '${this.cursorVariantDay}'.`);
        this.emit('cursor-variant-changed', 'day');
    }

    _onCursorVariantNightChanged(_settings, _changedKey) {
        logDebug(`Cursor night variant has changed to '${this.cursorVariantNight}'.`);
        this.emit('cursor-variant-changed', 'night');
    }

    _onCursorVariantOriginalChanged(_settings, _changedKey) {
        logDebug(`Cursor original variant has changed to '${this.cursorVariantOriginal}'.`);
        this.emit('cursor-variant-changed', 'original');
    }


    /* Icon variants */

    _onIconVariantsStatusChanged(_settings, _changedKey) {
        logDebug(`Icon variants have been ${this.iconVariantsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('icon-variants-status-changed', this.iconVariantsEnabled);
    }

    _onIconVariantDayChanged(_settings, _changedKey) {
        logDebug(`Icon day variant has changed to '${this.iconVariantDay}'.`);
        this.emit('icon-variant-changed', 'day');
    }

    _onIconVariantNightChanged(_settings, _changedKey) {
        logDebug(`Icon night variant has changed to '${this.iconVariantNight}'.`);
        this.emit('icon-variant-changed', 'night');
    }

    _onIconVariantOriginalChanged(_settings, _changedKey) {
        logDebug(`Icon original variant has changed to '${this.iconVariantOriginal}'.`);
        this.emit('icon-variant-changed', 'original');
    }


    /* Time source */

    _onTimeSourceChanged(_settings, _changedKey) {
        logDebug(`Time source has changed to ${this.timeSource}.`);
        this.emit('time-source-changed', this.timeSource);
    }

    _onManualTimeSourceChanged(_settings, _changedKey) {
        logDebug(`Manual time source has been ${this.manualTimeSource ? 'ena' : 'disa'}bled.`);
        this.emit('manual-time-source-changed', this.manualTimeSource);
    }

    _onOndemandKeybindingChanged(_settings, _changedKey) {
        if (this.ondemandKeybinding)
            logDebug(`On-demand keybinding has changed to ${this.ondemandKeybinding}.`);
        else
            logDebug('On-demand keybinding has been cleared.');
        this.emit('ondemand-keybinding-changed', this.ondemandKeybinding);
    }


    /* Commands */

    _onCommandsStatusChanged(_settings, _changedKey) {
        logDebug(`Commands have been ${this.commandsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('commands-status-changed', this.commandsEnabled);
    }


    /* Backgrounds */

    _onBackgroundsStatusChanged(_settings, _changedKey) {
        logDebug(`Backgrounds have been ${this.backgroundsEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('backgrounds-status-changed', this.backgroundsEnabled);
    }

    _onBackgroundDayChanged(_settings, _changedKey) {
        logDebug(`Day background has changed to '${this.backgroundDay}'.`);
        this.emit('background-time-changed', 'day');
    }

    _onBackgroundNightChanged(_settings, _changedKey) {
        logDebug(`Night background has changed to '${this.backgroundNight}'.`);
        this.emit('background-time-changed', 'night');
    }


    /* Night Light */

    _onNightlightStatusChanged(_settings, _changedKey) {
        logDebug(`Night Light has been ${this.nightlightEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('nightlight-status-changed', this.nightlightEnabled);
    }


    /* Location */

    _onLocationStatusChanged(_settings, _changedKey) {
        logDebug(`Location has been ${this.locationEnabled ? 'ena' : 'disa'}bled.`);
        this.emit('location-status-changed', this.locationEnabled);
    }


    /* GTK theme */

    _onGtkThemeChanged(_settings, _changedKey) {
        logDebug(`GTK theme has changed to '${this.gtkTheme}'.`);
        this.emit('gtk-theme-changed', this.gtkTheme);
    }


    /* Icon theme */

    _onIconThemeChanged(_settings, _changedKey) {
        logDebug(`Cursor theme has changed to '${this.iconTheme}'.`);
        this.emit('icon-theme-changed', this.iconTheme);
    }


    /* Cursor theme */

    _onCursorThemeChanged(_settings, _changedKey) {
        logDebug(`Cursor theme has changed to '${this.cursorTheme}'.`);
        this.emit('cursor-theme-changed', this.cursorTheme);
    }


    /* Background */

    _onBackgroundChanged(_settings, _changedKey) {
        logDebug(`Background has changed to '${this.background}'.`);
        this.emit('background-changed', this.background);
    }


    /* Shell theme */

    _onShellThemeChanged(_settings, _changedKey) {
        logDebug(`Shell theme has changed to '${this.shellTheme}'.`);
        this.emit('shell-theme-changed', this.shellTheme);
    }

};
Signals.addSignalMethods(SettingsManager.prototype);
