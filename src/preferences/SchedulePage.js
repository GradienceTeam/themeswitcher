// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const { Adw, Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const utils = Me.imports.utils;

const { DropDownChoice } = Me.imports.preferences.DropDownChoice;


var SchedulePage = GObject.registerClass({
    GTypeName: 'SchedulePage',
    Template: 'resource:///org/gnome/shell/extensions/nightthemeswitcher/preferences/ui/SchedulePage.ui',
    InternalChildren: [
        'keyboard_shortcut_button',
        'manual_time_source_switch',
        'time_source_combo_row',
        'schedule_sunrise_time_chooser',
        'schedule_sunset_time_chooser',
    ],
}, class SchedulePage extends Adw.PreferencesPage {
    constructor(props = {}) {
        super(props);
        const settings = extensionUtils.getSettings(`${Me.metadata['settings-schema']}.time`);
        const colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        const locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });

        settings.bind('manual-time-source', this._manual_time_source_switch, 'active', Gio.SettingsBindFlags.DEFAULT);

        const choiceFilter = new Gtk.BoolFilter({ expression: Gtk.PropertyExpression.new(DropDownChoice, null, 'enabled') });

        const nightlightChoice = new DropDownChoice({ id: 'nightlight', title: _('Night Light') });
        nightlightChoice.connect('notify::enabled', () => choiceFilter.changed(Gtk.FilterChange.DIFFERENT));
        colorSettings.bind('night-light-enabled', nightlightChoice, 'enabled', Gio.SettingsBindFlags.GET);

        const locationChoice = new DropDownChoice({ id: 'location', title: _('Location Services') });
        locationChoice.connect('notify::enabled', () => choiceFilter.changed(Gtk.FilterChange.DIFFERENT));
        locationSettings.bind('enabled', locationChoice, 'enabled', Gio.SettingsBindFlags.GET);

        const timeSources = Gio.ListStore.new(DropDownChoice);
        timeSources.splice(0, 0, [
            nightlightChoice,
            locationChoice,
            new DropDownChoice({ id: 'schedule', title: _('Manual schedule') }),
        ]);

        this._time_source_combo_row.model = new Gtk.FilterListModel({
            model: timeSources,
            filter: choiceFilter,
        });
        this._time_source_combo_row.expression = Gtk.PropertyExpression.new(DropDownChoice, null, 'title');
        this._time_source_combo_row.connect('notify::selected-item', () => settings.set_string('time-source', this._time_source_combo_row.selected_item.id));
        const updateTimeSourceComboRowState = () => {
            this._time_source_combo_row.selected = utils.findItemPositionInModel(this._time_source_combo_row.model, item => item.id === settings.get_string('time-source'));
            this._time_source_combo_row.sensitive = settings.get_boolean('manual-time-source');
        };
        settings.connect('changed::time-source', () => updateTimeSourceComboRowState());
        updateTimeSourceComboRowState();

        settings.bind('schedule-sunrise', this._schedule_sunrise_time_chooser, 'time', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('schedule-sunset', this._schedule_sunset_time_chooser, 'time', Gio.SettingsBindFlags.DEFAULT);

        settings.connect('changed::nightthemeswitcher-ondemand-keybinding', () => {
            this._keyboard_shortcut_button.keybinding = settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
        });
        this._keyboard_shortcut_button.connect('notify::keybinding', () => {
            settings.set_strv('nightthemeswitcher-ondemand-keybinding', [this._keyboard_shortcut_button.keybinding]);
        });
        this._keyboard_shortcut_button.keybinding = settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
    }
});
