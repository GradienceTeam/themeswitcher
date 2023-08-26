// SPDX-FileCopyrightText: Night Theme Switcher Contributors
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

        // ln -sfr ~/.config/gtk-4.0/gtk-${style}.css ~/.config/gtk-4.0/gtk.css
        GLib.spawn_async(null, ['sh', '-c', `ln -sfr ~/.config/gtk-4.0/gtk-${time === Time.DAY ? 'sunrise' : 'sunset'}.css ~/.config/gtk-4.0/gtk.css`], null, GLib.SpawnFlags.SEARCH_PATH, null);
        
        debug.message(`Spawned ${time} command.`);
    }
}
