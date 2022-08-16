// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio, Meta, Shell } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const debug = Me.imports.debug;

const { Time } = Me.imports.enums.Time;
const { TimerNightlight } = Me.imports.modules.TimerNightlight;
const { TimerLocation } = Me.imports.modules.TimerLocation;
const { TimerSchedule } = Me.imports.modules.TimerSchedule;


/**
 * The Timer is responsible for signaling any time change to the other modules.
 *
 * They can connect to its 'time-changed' signal and ask its 'time' property
 * for the current time.
 *
 * It will try to use one of these three different time sources, in this order
 * of preference:
 *   - Night Light
 *   - Location Services
 *   - Manual schedule
 *
 * The user can manually force a specific time source and set the manual
 * schedule in the extensions's preferences.
 */
var Timer = class {
    #settings;
    #interfaceSettings;
    #colorSettings;
    #locationSettings;
    #time;

    #source = null;
    #sourceConnectionId = null;
    #previousKeybinding = null;
    #settingsConnections = [];

    constructor() {
        this.#settings = extensionUtils.getSettings(`${Me.metadata['settings-schema']}.time`);
        this.#interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        this.#colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        this.#locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });
        this.#time = this.#interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? Time.NIGHT : Time.DAY;
    }

    enable() {
        debug.message('Enabling Timer...');
        this.#connectSettings();
        this.#createSource();
        this.#connectSource();
        this.#enableSource();
        this.#addKeybinding();
        debug.message('Timer enabled.');
    }

    disable() {
        debug.message('Disabling Timer...');
        this.#removeKeybinding();
        this.#disconnectSources();
        this.#disableSource();
        this.#disconnectSettings();
        debug.message('Timer disabled.');
    }


    get time() {
        return this.#time;
    }

    set time(time) {
        if (time === this.#time)
            return;
        debug.message(`Time has changed to ${time}.`);
        this.#time = time;
        if (this.#settings.get_boolean('transition'))
            main.layoutManager.screenTransition.run();
        this.#interfaceSettings.set_string('color-scheme', time === Time.NIGHT ? 'prefer-dark' : 'default');
        this.emit('time-changed', time);
    }


    #connectSettings() {
        debug.message('Connecting Timer to settings...');
        this.#settingsConnections.push({
            settings: this.#colorSettings,
            id: this.#colorSettings.connect('changed::night-light-enabled', this.#onSourceChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#locationSettings,
            id: this.#locationSettings.connect('changed::enabled', this.#onSourceChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#settings,
            id: this.#settings.connect('changed::time-source', this.#onTimeSourceChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#settings,
            id: this.#settings.connect('changed::nightthemeswitcher-ondemand-keybinding', this.#onOndemandKeybindingChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#interfaceSettings,
            id: this.#interfaceSettings.connect('changed::color-scheme', this.#onColorSchemeChanged.bind(this)),
        });
    }

    #disconnectSettings() {
        this.#settingsConnections.forEach(connection => connection.settings.disconnect(connection.id));
        this.#settingsConnections = [];
        debug.message('Disconnected Timer from settings.');
    }

    #createSource() {
        const source = this.#getSource();
        switch (source) {
        case 'nightlight':
            this.#source = new TimerNightlight();
            break;
        case 'location':
            this.#source = new TimerLocation();
            break;
        case 'schedule':
            this.#source = new TimerSchedule();
            break;
        }
    }

    #enableSource() {
        this.#source.enable();
    }

    #disableSource() {
        if (this.#source)
            this.#source.disable();
        this.#source = null;
    }

    #connectSource() {
        debug.message('Connecting to time source...');
        this.#sourceConnectionId = this.#source.connect('time-changed', this.#onTimeChanged.bind(this));
    }

    #disconnectSource() {
        if (this.#sourceConnectionId && this.#source)
            this.#source.disconnect(this.#sourceConnectionId);
        this.#sourceConnectionId = null;
        debug.message('Disconnected from time source.');
    }


    #onSourceChanged() {
        this.disable();
        this.enable();
    }

    #onTimeSourceChanged() {
        if (this.#settings.get_boolean('manual-time-source'))
            this.#onSourceChanged();
    }

    #onOndemandKeybindingChanged() {
        this.#removeKeybinding();
        this.#addKeybinding();
    }

    #onTimeChanged(_source, newTime) {
        this.time = newTime;
    }

    #onColorSchemeChanged() {
        this.time = this.#interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? Time.NIGHT : Time.DAY;
    }


    #getSource() {
        debug.message('Getting time source...');

        let source;
        if (this.#settings.get_boolean('manual-time-source')) {
            source = this.#settings.get_string('time-source');
            debug.message(`Time source is forced to ${source}.`);
            if (
                (source === 'nightlight' && !this.#colorSettings.get_boolean('night-light-enabled')) ||
                (source === 'location' && !this.#locationSettings.get_boolean('enabled'))
            ) {
                debug.message(`Unable to choose ${source} time source, falling back to manual schedule.`);
                source = 'schedule';
                this.#settings.set_string('time-source', source);
            }
        } else {
            if (this.#colorSettings.get_boolean('night-light-enabled'))
                source = 'nightlight';
            else if (this.#locationSettings.get_boolean('enabled'))
                source = 'location';
            else
                source = 'schedule';
            debug.message(`Time source is ${source}.`);
            this.#settings.set_string('time-source', source);
        }
        return source;
    }


    #addKeybinding() {
        this.#previousKeybinding = this.#settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
        if (!this.#settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0])
            return;
        debug.message('Adding keybinding...');
        main.wm.addKeybinding(
            'nightthemeswitcher-ondemand-keybinding',
            this.#settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => {
                this.time = this.time === Time.NIGHT ? Time.DAY : Time.NIGHT;
            }
        );
        debug.message('Added keybinding.');
    }

    #removeKeybinding() {
        if (this.#previousKeybinding) {
            debug.message('Removing keybinding...');
            main.wm.removeKeybinding('nightthemeswitcher-ondemand-keybinding');
            debug.message('Removed keybinding.');
        }
    }
};
Signals.addSignalMethods(Timer.prototype);
