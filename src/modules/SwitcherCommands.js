// SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const debug = Me.imports.debug;

const { Switcher } = Me.imports.modules.Switcher;

const { Time } = Me.imports.enums.Time;


/**
 * The Commands Switcher spawns commands according to the time.
 *
 * @param {Object} params Params object.
 * @param {Timer} params.timer Timer to listen to.
 */
var SwitcherCommands = class extends Switcher {
    #settings;

    constructor({ timer }) {
        const settings = extensionUtils.getSettings(`${Me.metadata['settings-schema']}.commands`);
        super({
            name: 'Command',
            timer,
            settings,
            callback: time => this.#onTimeChanged(time),
        });
        this.#settings = settings;
    }

    #onTimeChanged(time) {
        if (time === Time.UNKNOWN)
            return;
        const command = this.#settings.get_string(time === Time.DAY ? 'sunrise' : 'sunset');
        if (!command)
            return;
        GLib.spawn_async(null, ['sh', '-c', command], null, GLib.SpawnFlags.SEARCH_PATH, null);
        debug.message(`Spawned ${time} command.`);
    }
};
