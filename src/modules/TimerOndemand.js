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

const { Shell, St } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main, panelMenu } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug } = Me.imports.utils;
const { keyBindingAutoRepeat, getActor } = Me.imports.compat;

/**
 * The On-demand Timer allows the user to manually switch between the day and
 * night variants with a button in the top bar and a keybinding.
 *
 * The user can change the key combination in the extension's preferences.
 */
var TimerOndemand = class {

    constructor() {
        this._button = null;
        this._icon = null;
    }

    enable() {
        logDebug('Enabling On-demand Timer ...');
        this._addKeybinding();
        this._addButton();
        logDebug('On-demand Timer enabled.');
    }

    disable() {
        logDebug('Disabling On-demand Timer ...');
        this._removeKeybinding();
        this._removeButton();
        logDebug('On-demand Timer disabled.');
    }


    get time() {
        return e.settingsManager.ondemandTime;
    }

    _addKeybinding() {
        logDebug('Adding On-demand Timer keybinding...');
        // add our own keydinging handler
        main.wm.addKeybinding(
            'nightthemeswitcher-ondemand-keybinding',
            e.settingsManager._extensionsSettings,
            keyBindingAutoRepeat(),
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this._toggleTime.bind(this)
        );
        logDebug('Added On-demand Timer keybinding.');
    }

    _removeKeybinding() {
        logDebug('Removing On-demand Timer keybinding...');
        main.wm.removeKeybinding('nightthemeswitcher-ondemand-keybinding');
        logDebug('Removed On-demand Timer keybinding.');
    }

    _addButton() {
        logDebug('Adding On-demand Timer button...');

        this._icon = new St.Icon({
            icon_name: this._getIconNameForCurrentTime(),
            style_class: 'system-status-icon',
        });

        this._button = new panelMenu.Button(0.0);
        const buttonActor = getActor(this._button);
        buttonActor.add_actor(this._icon);
        buttonActor.connect(
            'button-press-event',
            this._toggleTime.bind(this)
        );
        main.panel.addToStatusArea('NightThemeSwitcherButton', this._button);

        logDebug('Added On-demand Timer button.');
    }

    _removeButton() {
        logDebug('Removing On-demand Timer button...');
        this._button.destroy();
        logDebug('Removed On-demand Timer button.');
    }

    _toggleTime() {
        e.settingsManager.ondemandTime = e.timer.time === 'day' ? 'night' : 'day';
        this.emit('time-changed', this.time);
        this._icon.icon_name = this._getIconNameForCurrentTime();

    }

    _getIconNameForCurrentTime() {
        return e.timer.time === 'day' ? 'weather-clear-symbolic' : 'weather-clear-night-symbolic';
    }

};
Signals.addSignalMethods(TimerOndemand.prototype);
