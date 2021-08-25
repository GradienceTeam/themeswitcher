// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const e = Me.imports.extension;
const utils = Me.imports.utils;
const { logDebug } = utils;


/**
 * The Commander is responsible for spawning commands according to the time.
 */
var Commander = class {
    constructor() {
        this._commandsSettings = extensionUtils.getSettings(utils.getSettingsSchema('commands'));
        this._statusConnection = null;
        this._timerConnection = null;
    }

    enable() {
        logDebug('Enabling Commander...');
        this._watchStatus();
        if (this._commandsSettings.get_boolean('enabled')) {
            this._connectTimer();
            this._spawnCommand(e.timer.time);
        }
        logDebug('Commander enabled.');
    }

    disable() {
        logDebug('Disabling Commander...');
        this._disconnectTimer();
        this._unwatchStatus();
        logDebug('Commander disabled.');
    }


    _watchStatus() {
        logDebug('Watching commands status...');
        this._statusConnection = this._commandsSettings.connect('changed::enabled', this._onStatusChanged.bind(this));
    }

    _unwatchStatus() {
        if (this._statusConnection) {
            this._commandsSettings.disconnect(this._statusConnection);
            this._statusConnection = null;
        }
        logDebug('Stopped watching commands status.');
    }

    _connectTimer() {
        logDebug('Connecting Commander to Timer...');
        this._timerConnection = e.timer.connect('time-changed', this._onTimeChanged.bind(this));
    }

    _disconnectTimer() {
        if (this._timerConnection) {
            e.timer.disconnect(this._timerConnection);
            this._timerConnection = null;
        }
        logDebug('Disconnecting Commander from Timer.');
    }


    _onStatusChanged() {
        logDebug(`Commands launching has been ${this._commandsSettings.get_boolean('enabled') ? 'enabled' : 'disabled'}.`);
        this.disable();
        this.enable();
    }

    _onTimeChanged() {
        this._spawnCommand();
    }


    _spawnCommand() {
        if (!e.timer.time)
            return;
        const command = this._commandsSettings.get_string(e.timer.time === 'day' ? 'sunrise' : 'sunset');
        GLib.spawn_async(null, ['sh', '-c', command], null, GLib.SpawnFlags.SEARCH_PATH, null);
        logDebug(`Spawned ${e.timer.time} command.`);
    }
};
