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

const { main, panelMenu: PanelMenu, popupMenu: PopupMenu } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const { logDebug, findShellAggregateMenuItemPosition } = Me.imports.utils;
const { keyBindingAutoRepeat, getActor } = Me.imports.compat;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;

/**
 * The On-demand Timer allows the user to manually switch between the day and
 * night variants with a button in the top bar and a keybinding.
 *
 * The user can change the key combination in the extension's preferences.
 */
var TimerOndemand = class {

    constructor() {
        this._button = null;
        this._ondemandKeybindingConnect = null;
        this._ondemandButtonPlacementConnect = null;
    }

    enable() {
        logDebug('Enabling On-demand Timer...');
        this._connectSettings();
        this._addKeybinding();
        this._addButton();
        this.emit('time-changed', this.time);
        logDebug('On-demand Timer enabled.');
    }

    disable() {
        logDebug('Disabling On-demand Timer...');
        this._removeKeybinding();
        this._removeButton();
        this._disconnectSettings();
        logDebug('On-demand Timer disabled.');
    }


    get time() {
        return e.settingsManager.ondemandTime;
    }


    _connectSettings() {
        logDebug('Connecting On-demand Timer to settings...');
        this._ondemandKeybindingConnect = e.settingsManager.connect('ondemand-keybinding-changed', this._onOndemandKeybindingChanged.bind(this));
        this._ondemandButtonPlacementConnect = e.settingsManager.connect('ondemand-button-placement-changed', this._onOndemandButtonPlacementChanged.bind(this));
    }

    _disconnectSettings() {
        logDebug('Disconnecting On-demand Timer from settings...');
        if (this._ondemandKeybindingConnect) {
            e.settingsManager.disconnect(this._ondemandKeybindingConnect);
            this._ondemandKeybindingConnect = null;
        }
        if (this._ondemandButtonPlacementConnect) {
            e.settingsManager.disconnect(this._ondemandButtonPlacementConnect);
            this._ondemandButtonPlacementConnect = null;
        }
    }


    _onOndemandKeybindingChanged(_settings, _keybinding) {
        this._removeKeybinding();
        this._addKeybinding();
    }

    _onOndemandButtonPlacementChanged(_settings, _placement) {
        this._removeButton();
        this._addButton();
    }


    _addKeybinding() {
        if (!e.settingsManager.ondemandKeybinding)
            return;
        logDebug('Adding On-demand Timer keybinding...');
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
        switch (e.settingsManager.ondemandButtonPlacement) {
        case 'panel':
            this._addButtonToPanel();
            break;
        case 'menu':
            this._addButtonToMenu();
            break;
        }
    }

    _removeButton() {
        if (this._button) {
            logDebug('Removing On-demand Timer button...');
            this._button.destroy();
            this._button = null;
            logDebug('Removed On-demand Timer button.');
        }
    }

    _addButtonToPanel() {
        logDebug('Adding On-demand Timer button to the panel...');
        const getIconNameForCurrentTime = () => e.timer.time === 'day' ? 'weather-clear-symbolic' : 'weather-clear-night-symbolic';
        const icon = new St.Icon({
            icon_name: getIconNameForCurrentTime(),
            style_class: 'system-status-icon',
        });
        this._button = new PanelMenu.Button(0.0);
        const buttonActor = getActor(this._button);
        buttonActor.add_actor(icon);
        buttonActor.connect('button-press-event', () => {
            this._toggleTime();
            icon.icon_name = getIconNameForCurrentTime();
        });
        main.panel.addToStatusArea('NightThemeSwitcherButton', this._button);
        logDebug('Added On-demand Timer button to the panel.');
    }

    _addButtonToMenu() {
        logDebug('Adding On-demand Timer button to the menu...');
        const aggregateMenu = main.panel.statusArea.aggregateMenu;
        const position = findShellAggregateMenuItemPosition(aggregateMenu._system.menu) - 1;
        const getLabelForCurrentTime = () => e.timer.time === 'day' ? _('Switch to night theme') : _('Switch to day theme');
        const getIconNameForCurrentTime = () => e.timer.time === 'day' ? 'weather-clear-night-symbolic' : 'weather-clear-symbolic';
        this._button = new PopupMenu.PopupImageMenuItem(getLabelForCurrentTime(), getIconNameForCurrentTime());
        this._button.connect('activate', () => {
            this._toggleTime();
            this._button.label.text = getLabelForCurrentTime();
            this._button.setIcon(getIconNameForCurrentTime());
        });
        aggregateMenu.menu.addMenuItem(this._button, position);
        logDebug('Added On-demand Timer button to the menu.');
    }

    _toggleTime() {
        e.settingsManager.ondemandTime = e.timer.time === 'day' ? 'night' : 'day';
        this.emit('time-changed', this.time);
    }

};
Signals.addSignalMethods(TimerOndemand.prototype);
