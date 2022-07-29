// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Gio } = imports.gi;
const { extensionUtils } = imports.misc;
const Signals = imports.signals;

const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();

const debug = Me.imports.debug;

const { Time } = Me.imports.enums.Time;
const { TimerNightlight } = Me.imports.modules.TimerNightlight;
const { TimerLocation } = Me.imports.modules.TimerLocation;
const { TimerSchedule } = Me.imports.modules.TimerSchedule;
const { TimerOndemand } = Me.imports.modules.TimerOndemand;


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

    #sources = [];
    #settingsConnections = [];
    #timeConnections = [];

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
        this.#createSources();
        this.#connectSources();
        this.#enableSources();
        debug.message('Timer enabled.');
    }

    disable() {
        debug.message('Disabling Timer...');
        this.#disconnectSources();
        this.#disableSources();
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
            id: this.#settings.connect('changed::manual-time-source', this.#onSourceChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#settings,
            id: this.#settings.connect('changed::always-enable-ondemand', this.#onSourceChanged.bind(this)),
        });
        this.#settingsConnections.push({
            settings: this.#settings,
            id: this.#settings.connect('changed::time-source', this.#onTimeSourceChanged.bind(this)),
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

    #createSources() {
        const source = this.#getSource();
        switch (source) {
        case 'nightlight':
            this.#sources.push(new TimerNightlight());
            break;
        case 'location':
            this.#sources.push(new TimerLocation());
            break;
        case 'schedule':
            this.#sources.push(new TimerSchedule());
            break;
        case 'ondemand':
            this.#sources.push(new TimerOndemand({ timer: this }));
            break;
        }

        if (this.#settings.get_boolean('always-enable-ondemand') && ['nightlight', 'location', 'schedule'].includes(source))
            this.#sources.unshift(new TimerOndemand({ timer: this }));
    }

    #enableSources() {
        this.#sources.forEach(source => source.enable());
    }

    #disableSources() {
        this.#sources.forEach(source => source.disable());
        this.#sources = [];
    }

    #connectSources() {
        debug.message('Connecting to time sources...');
        this.#sources.forEach(source => this.#timeConnections.push({
            source,
            id: source.connect('time-changed', this.#onTimeChanged.bind(this)),
        }));
    }

    #disconnectSources() {
        this.#timeConnections.forEach(connection => connection.source.disconnect(connection.id));
        this.#timeConnections = [];
        debug.message('Disconnected from time sources.');
    }


    #onSourceChanged() {
        this.disable();
        this.enable();
    }

    #onTimeSourceChanged() {
        if (this.#settings.get_boolean('manual-time-source'))
            this.#onSourceChanged();
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
};
Signals.addSignalMethods(Timer.prototype);
