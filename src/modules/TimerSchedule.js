// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const Me = extensionUtils.getCurrentExtension();

const debug = Me.imports.debug;

const { Time } = Me.imports.enums.Time;


/**
 * The Schedule Timer uses a manual schedule to get the current time.
 *
 * Every second, it will check if the time has changed and signal if that's the
 * case.
 *
 * The user can change the schedule in the extension's preferences.
 */
var TimerSchedule = class {
    #settings;

    #previouslyDaytime = null;
    #timeChangeTimer = null;

    constructor() {
        this.#settings = extensionUtils.getSettings(`${Me.metadata['settings-schema']}.time`);
    }

    enable() {
        debug.message('Enabling Schedule Timer...');
        this.#watchForTimeChange();
        this.emit('time-changed', this.time);
        debug.message('Schedule Timer enabled.');
    }

    disable() {
        debug.message('Disabling Schedule Timer...');
        this.#stopWatchingForTimeChange();
        debug.message('Schedule Timer disabled.');
    }


    get time() {
        return this.#isDaytime() ? Time.DAY : Time.NIGHT;
    }


    #isDaytime() {
        const time = GLib.DateTime.new_now_local();
        const hour = time.get_hour() + time.get_minute() / 60 + time.get_second() / 3600;
        return hour >= this.#settings.get_double('schedule-sunrise') && hour <= this.#settings.get_double('schedule-sunset');
    }

    #watchForTimeChange() {
        debug.message('Watching for time change...');
        this.#timeChangeTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            if (this.#previouslyDaytime !== this.#isDaytime()) {
                this.#previouslyDaytime = this.#isDaytime();
                this.emit('time-changed', this.time);
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    #stopWatchingForTimeChange() {
        GLib.Source.remove(this.#timeChangeTimer);
        debug.message('Stopped watching for time change.');
    }
};
Signals.addSignalMethods(TimerSchedule.prototype);
