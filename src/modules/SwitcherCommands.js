// SPDX-FileCopyrightText: 2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

import GLib from 'gi://GLib';

import * as debug from '../debug.js';

import { Time } from '../enums/Time.js';

import { Switcher } from './Switcher.js';


/**
 * The Commands Switcher spawns commands according to the time.
 */
export class SwitcherCommands extends Switcher {
    #settings;

    /**
     * @param {object} params Params object.
     * @param {Timer} params.timer Timer to listen to.
     * @param {Gio.Settings} params.settings Commands settings.
     */
    constructor({ timer, settings }) {
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
}
