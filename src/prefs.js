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

'use strict';

const { Gdk, GdkPixbuf, Gio, GLib, GObject, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { compat, utils } = Me.imports;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


function init() {
    compat.initTranslations(Me.metadata.uuid);
}

function buildPrefsWidget() {
    const prefsWidget = new Preferences();
    return prefsWidget;
}


const Preferences = class {

    constructor() {
        this.settings = compat.getExtensionSettings();
        this.colorSettings = new Gio.Settings({ schema: 'org.gnome.settings-daemon.plugins.color' });
        this.locationSettings = new Gio.Settings({ schema: 'org.gnome.system.location' });

        this.builder = new Gtk.Builder();
        this.builder.set_translation_domain(Me.metadata.uuid);
        this.builder.add_from_file(GLib.build_filenamev([Me.path, 'prefs.ui']));

        this.widget = this.builder.get_object('prefs_notebook');

        this._connectSchedulePreferences();
        this._connectGtkThemePreferences();
        this._connectShellThemePreferences();
        this._connectIconThemePreferences();
        this._connectCursorThemePreferences();
        this._connectBackgroundPreferences();
        this._connectCommandsPreferences();
        this._connectOndemandKeyboardShortcutDialog();

        return this.widget;
    }

    _connectSchedulePreferences() {
        const scheduleAutoSwitch = this.builder.get_object('prefs_schedule_auto_switch');
        this.settings.bind(
            'manual-time-source',
            scheduleAutoSwitch,
            'active',
            Gio.SettingsBindFlags.INVERT_BOOLEAN
        );

        const scheduleManualTimeSource = this.builder.get_object('prefs_schedule_manual_time_source');
        this.settings.bind(
            'manual-time-source',
            scheduleManualTimeSource,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const scheduleManualTimeSourceNightlightRadio = this.builder.get_object('prefs_schedule_manual_time_source_nightlight_radio');
        const updateScheduleManualTimeSourceNightlightRadioActivity = () => {
            scheduleManualTimeSourceNightlightRadio.active = this.settings.get_string('time-source') === 'nightlight';
        };
        this.settings.connect('changed::time-source', () => updateScheduleManualTimeSourceNightlightRadioActivity());
        this.colorSettings.bind(
            'night-light-enabled',
            scheduleManualTimeSourceNightlightRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        scheduleManualTimeSourceNightlightRadio.connect('toggled', () => {
            if (scheduleManualTimeSourceNightlightRadio.active)
                this.settings.set_string('time-source', 'nightlight');
        });
        updateScheduleManualTimeSourceNightlightRadioActivity();

        const scheduleManualTimeSourceLocationRadio = this.builder.get_object('prefs_schedule_manual_time_source_location_radio');
        const updateScheduleManualTimeSourceLocationRadioActivity = () => {
            scheduleManualTimeSourceLocationRadio.active = this.settings.get_string('time-source') === 'location';
        };
        this.settings.connect('changed::time-source', () => updateScheduleManualTimeSourceLocationRadioActivity());
        this.locationSettings.bind(
            'enabled',
            scheduleManualTimeSourceLocationRadio,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        scheduleManualTimeSourceLocationRadio.connect('toggled', () => {
            if (scheduleManualTimeSourceLocationRadio.active)
                this.settings.set_string('time-source', 'location');
        });
        updateScheduleManualTimeSourceLocationRadioActivity();

        const scheduleManualTimeSourceManualRadio = this.builder.get_object('prefs_schedule_manual_time_source_manual_radio');
        const updateScheduleManualTimeSourceManualRadioActivity = () => {
            scheduleManualTimeSourceManualRadio.active = this.settings.get_string('time-source') === 'schedule';
        };
        this.settings.connect('changed::time-source', () => updateScheduleManualTimeSourceManualRadioActivity());
        scheduleManualTimeSourceManualRadio.connect('toggled', () => {
            if (scheduleManualTimeSourceManualRadio.active)
                this.settings.set_string('time-source', 'schedule');
        });
        updateScheduleManualTimeSourceManualRadioActivity();

        const scheduleManualTimeSourceOndemandRadio = this.builder.get_object('prefs_schedule_manual_time_source_ondemand_radio');
        const updateScheduleManualTimeSourceOndemandRadioActivity = () => {
            scheduleManualTimeSourceOndemandRadio.active = this.settings.get_string('time-source') === 'ondemand';
        };
        this.settings.connect('changed::time-source', () => updateScheduleManualTimeSourceOndemandRadioActivity());
        scheduleManualTimeSourceOndemandRadio.connect('toggled', () => {
            if (scheduleManualTimeSourceOndemandRadio.active)
                this.settings.set_string('time-source', 'ondemand');
        });
        updateScheduleManualTimeSourceOndemandRadioActivity();

        const scheduleManualScheduleTimes = this.builder.get_object('prefs_schedule_manual_schedule_times');
        const updateScheduleManualScheduleTimesVisibility = () => {
            scheduleManualScheduleTimes.visible = this.settings.get_string('time-source') === 'schedule';
        };
        this.settings.bind(
            'manual-time-source',
            scheduleManualScheduleTimes,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.connect('changed::time-source', () => updateScheduleManualScheduleTimesVisibility());
        updateScheduleManualScheduleTimesVisibility();

        const scheduleManualScheduleTimesSunriseHoursSpin = this.builder.get_object('prefs_schedule_manual_schedule_times_sunrise_hours_spin');
        scheduleManualScheduleTimesSunriseHoursSpin.value = Math.trunc(this.settings.get_double('schedule-sunrise'));
        scheduleManualScheduleTimesSunriseHoursSpin.connect('output', () => {
            const text = scheduleManualScheduleTimesSunriseHoursSpin.adjustment.value.toString().padStart(2, '0');
            scheduleManualScheduleTimesSunriseHoursSpin.set_text(text);
            return true;
        });
        scheduleManualScheduleTimesSunriseHoursSpin.connect('value-changed', () => {
            const oldTime = this.settings.get_double('schedule-sunrise');
            const oldHour = Math.trunc(oldTime);
            const newMinutes = oldTime - oldHour;
            const newTime = scheduleManualScheduleTimesSunriseHoursSpin.value + newMinutes;
            this.settings.set_double('schedule-sunrise', newTime);
        });

        const scheduleManualScheduleTimesSunriseMinutesSpin = this.builder.get_object('prefs_schedule_manual_schedule_times_sunrise_minutes_spin');
        scheduleManualScheduleTimesSunriseMinutesSpin.value = Math.round((this.settings.get_double('schedule-sunrise') - Math.trunc(this.settings.get_double('schedule-sunrise'))) * 60);
        scheduleManualScheduleTimesSunriseMinutesSpin.connect('output', () => {
            const text = scheduleManualScheduleTimesSunriseMinutesSpin.adjustment.value.toString().padStart(2, '0');
            scheduleManualScheduleTimesSunriseMinutesSpin.set_text(text);
            return true;
        });
        scheduleManualScheduleTimesSunriseMinutesSpin.connect('value-changed', () => {
            const hour = Math.trunc(this.settings.get_double('schedule-sunrise'));
            const newMinutes = scheduleManualScheduleTimesSunriseMinutesSpin.value / 60;
            const newTime = hour + newMinutes;
            this.settings.set_double('schedule-sunrise', newTime);
        });

        const scheduleManualScheduleTimesSunsetHoursSpin = this.builder.get_object('prefs_schedule_manual_schedule_times_sunset_hours_spin');
        scheduleManualScheduleTimesSunsetHoursSpin.value = Math.trunc(this.settings.get_double('schedule-sunset'));
        scheduleManualScheduleTimesSunsetHoursSpin.connect('output', () => {
            const text = scheduleManualScheduleTimesSunsetHoursSpin.adjustment.value.toString().padStart(2, '0');
            scheduleManualScheduleTimesSunsetHoursSpin.set_text(text);
            return true;
        });
        scheduleManualScheduleTimesSunsetHoursSpin.connect('value-changed', () => {
            const oldTime = this.settings.get_double('schedule-sunset');
            const oldHour = Math.trunc(oldTime);
            const newMinutes = oldTime - oldHour;
            const newTime = scheduleManualScheduleTimesSunsetHoursSpin.value + newMinutes;
            this.settings.set_double('schedule-sunset', newTime);
        });

        const scheduleManualScheduleTimesSunsetMinutesSpin = this.builder.get_object('prefs_schedule_manual_schedule_times_sunset_minutes_spin');
        scheduleManualScheduleTimesSunsetMinutesSpin.value = Math.round((this.settings.get_double('schedule-sunset') - Math.trunc(this.settings.get_double('schedule-sunset'))) * 60);
        scheduleManualScheduleTimesSunsetMinutesSpin.connect('output', () => {
            const text = scheduleManualScheduleTimesSunsetMinutesSpin.adjustment.value.toString().padStart(2, '0');
            scheduleManualScheduleTimesSunsetMinutesSpin.set_text(text);
            return true;
        });
        scheduleManualScheduleTimesSunsetMinutesSpin.connect('value-changed', () => {
            const hour = Math.trunc(this.settings.get_double('schedule-sunset'));
            const newMinutes = scheduleManualScheduleTimesSunsetMinutesSpin.value / 60;
            const newTime = hour + newMinutes;
            this.settings.set_double('schedule-sunset', newTime);
        });

        const scheduleOndemand = this.builder.get_object('prefs_schedule_ondemand');
        const updateScheduleOndemandVisibility = () => {
            scheduleOndemand.visible = this.settings.get_string('time-source') === 'ondemand';
        };
        this.settings.bind(
            'manual-time-source',
            scheduleOndemand,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.connect('changed::time-source', () => updateScheduleOndemandVisibility());
        updateScheduleOndemandVisibility();

        const scheduleOndemandShortcutButton = this.builder.get_object('prefs_schedule_ondemand_shortcut_button');
        const updateScheduleOndemandShortcutButtonLabel = () => {
            const label = this.settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
            scheduleOndemandShortcutButton.label = label || _('Choose');
        };
        this.settings.connect('changed::nightthemeswitcher-ondemand-keybinding', () => updateScheduleOndemandShortcutButtonLabel());
        scheduleOndemandShortcutButton.connect('clicked', () => {
            const dialog = this.builder.get_object('ondemand_keyboard_shortcut_dialog');
            dialog.set_transient_for(this.widget.get_toplevel());
            dialog.show_all();
        });
        updateScheduleOndemandShortcutButtonLabel();

        const scheduleOndemandShortcutClearButton = this.builder.get_object('prefs_schedule_ondemand_shortcut_clear_button');
        scheduleOndemandShortcutClearButton.connect('clicked', () => {
            this.settings.set_strv('nightthemeswitcher-ondemand-keybinding', ['']);
        });
        const updateScheduleOndemandShortcutClearButtonVisibility = () => {
            scheduleOndemandShortcutClearButton.visible = !!this.settings.get_strv('nightthemeswitcher-ondemand-keybinding')[0];
        };
        this.settings.connect('changed::nightthemeswitcher-ondemand-keybinding', () => updateScheduleOndemandShortcutClearButtonVisibility());
        updateScheduleOndemandShortcutClearButtonVisibility();

        const scheduleOndemandButtonPlacementCombo = this.builder.get_object('prefs_schedule_ondemand_button_placement_combo');
        this.settings.bind(
            'ondemand-button-placement',
            scheduleOndemandButtonPlacementCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectGtkThemePreferences() {
        const gtkThemeSwitchVariantsSwitch = this.builder.get_object('prefs_gtk_theme_switch_variants_switch');
        this.settings.bind(
            'gtk-variants-enabled',
            gtkThemeSwitchVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const gtkThemeManualVariants = this.builder.get_object('prefs_gtk_theme_manual_variants');
        this.settings.bind(
            'gtk-variants-enabled',
            gtkThemeManualVariants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const gtkThemeManualVariantsSwitch = this.builder.get_object('prefs_gtk_theme_manual_variants_switch');
        this.settings.bind(
            'manual-gtk-variants',
            gtkThemeManualVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const gtkThemeVariants = this.builder.get_object('prefs_gtk_theme_variants');
        const updateGtkThemeVariantsSensitivity = () => {
            gtkThemeVariants.sensitive = !!(this.settings.get_boolean('gtk-variants-enabled') && this.settings.get_boolean('manual-gtk-variants'));
        };
        this.settings.connect('changed::gtk-variants-enabled', () => updateGtkThemeVariantsSensitivity());
        this.settings.connect('changed::manual-gtk-variants', () => updateGtkThemeVariantsSensitivity());
        updateGtkThemeVariantsSensitivity();

        const gtkThemeVariantsDayCombo = this.builder.get_object('prefs_gtk_theme_variants_day_combo');
        const gtkThemeVariantsNightCombo = this.builder.get_object('prefs_gtk_theme_variants_night_combo');
        const installedGtkThemes = Array.from(utils.getInstalledGtkThemes()).sort();
        installedGtkThemes.forEach(theme => {
            gtkThemeVariantsDayCombo.append(theme, theme);
            gtkThemeVariantsNightCombo.append(theme, theme);
        });
        this.settings.bind(
            'gtk-variant-day',
            gtkThemeVariantsDayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'gtk-variant-night',
            gtkThemeVariantsNightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectShellThemePreferences() {
        const shellThemeSwitchVariantsSwitch = this.builder.get_object('prefs_shell_theme_switch_variants_switch');
        this.settings.bind(
            'shell-variants-enabled',
            shellThemeSwitchVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const shellThemeManualVariants = this.builder.get_object('prefs_shell_theme_manual_variants');
        this.settings.bind(
            'shell-variants-enabled',
            shellThemeManualVariants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const shellThemeManualVariantsSwitch = this.builder.get_object('prefs_shell_theme_manual_variants_switch');
        this.settings.bind(
            'manual-shell-variants',
            shellThemeManualVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const shellThemeVariants = this.builder.get_object('prefs_shell_theme_variants');
        const updateShellThemeVariantsSensitivity = () => {
            shellThemeVariants.sensitive = !!(this.settings.get_boolean('shell-variants-enabled') && this.settings.get_boolean('manual-shell-variants'));
        };
        this.settings.connect('changed::shell-variants-enabled', () => updateShellThemeVariantsSensitivity());
        this.settings.connect('changed::manual-shell-variants', () => updateShellThemeVariantsSensitivity());
        updateShellThemeVariantsSensitivity();

        const shellThemeVariantsDayCombo = this.builder.get_object('prefs_shell_theme_variants_day_combo');
        const shellThemeVariantsNightCombo = this.builder.get_object('prefs_shell_theme_variants_night_combo');
        const installedShellThemes = Array.from(utils.getInstalledShellThemes()).sort();
        installedShellThemes.forEach(theme => {
            const themeName = theme === '' ? _('Default') : theme;
            shellThemeVariantsDayCombo.append(theme, themeName);
            shellThemeVariantsNightCombo.append(theme, themeName);
        });
        this.settings.bind(
            'shell-variant-day',
            shellThemeVariantsDayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'shell-variant-night',
            shellThemeVariantsNightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectIconThemePreferences() {
        const iconThemeSwitchVariantsSwitch = this.builder.get_object('prefs_icon_theme_switch_variants_switch');
        this.settings.bind(
            'icon-variants-enabled',
            iconThemeSwitchVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const iconThemeVariants = this.builder.get_object('prefs_icon_theme_variants');
        this.settings.bind(
            'icon-variants-enabled',
            iconThemeVariants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const installedIconThemes = Array.from(utils.getInstalledIconThemes()).sort();
        const iconThemeVariantsDayCombo = this.builder.get_object('prefs_icon_theme_variants_day_combo');
        const iconThemeVariantsNightCombo = this.builder.get_object('prefs_icon_theme_variants_night_combo');
        installedIconThemes.forEach(theme => {
            iconThemeVariantsDayCombo.append(theme, theme);
            iconThemeVariantsNightCombo.append(theme, theme);
        });
        this.settings.bind(
            'icon-variant-day',
            iconThemeVariantsDayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'icon-variant-night',
            iconThemeVariantsNightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectCursorThemePreferences() {
        const cursorThemeSwitchVariantsSwitch = this.builder.get_object('prefs_cursor_theme_switch_variants_switch');
        this.settings.bind(
            'cursor-variants-enabled',
            cursorThemeSwitchVariantsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const cursorThemeVariants = this.builder.get_object('prefs_cursor_theme_variants');
        this.settings.bind(
            'cursor-variants-enabled',
            cursorThemeVariants,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const installedCursorThemes = Array.from(utils.getInstalledCursorThemes()).sort();
        const cursorThemeVariantsDayCombo = this.builder.get_object('prefs_cursor_theme_variants_day_combo');
        const cursorThemeVariantsNightCombo = this.builder.get_object('prefs_cursor_theme_variants_night_combo');
        installedCursorThemes.forEach(theme => {
            cursorThemeVariantsDayCombo.append(theme, theme);
            cursorThemeVariantsNightCombo.append(theme, theme);
        });
        this.settings.bind(
            'cursor-variant-day',
            cursorThemeVariantsDayCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'cursor-variant-night',
            cursorThemeVariantsNightCombo,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectBackgroundPreferences() {
        const backgroundSwitchBackgroundsSwitch = this.builder.get_object('prefs_backgrounds_switch_backgrounds_switch');
        this.settings.bind(
            'backgrounds-enabled',
            backgroundSwitchBackgroundsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const backgroundsBackgrounds = this.builder.get_object('prefs_backgrounds_backgrounds');
        this.settings.bind(
            'backgrounds-enabled',
            backgroundsBackgrounds,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const backgroundsBackgroundsDayBackgroundButton = this.builder.get_object('prefs_backgrounds_backgrounds_day_background_button');
        const dayBackgroundPreview = this.builder.get_object('day_background_preview');
        const updateBackgroundsBackgroundsDayBackgroundButtonUri = () => {
            backgroundsBackgroundsDayBackgroundButton.set_uri(this.settings.get_string('background-day'));
        };
        this.settings.connect('changed::background-day', () => updateBackgroundsBackgroundsDayBackgroundButtonUri());
        backgroundsBackgroundsDayBackgroundButton.connect('update-preview', () => {
            const file = backgroundsBackgroundsDayBackgroundButton.get_preview_filename();
            const allowedContentTypes = ['image/jpeg', 'image/png', 'image/tiff'];
            if (allowedContentTypes.includes(Gio.content_type_guess(file, null)[0])) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(file, 256, 256);
                dayBackgroundPreview.set_from_pixbuf(pixbuf);
            }
        });
        backgroundsBackgroundsDayBackgroundButton.connect('file-set', () => {
            this.settings.set_string('background-day', backgroundsBackgroundsDayBackgroundButton.get_uri());
        });
        updateBackgroundsBackgroundsDayBackgroundButtonUri();

        const backgroundsBackgroundsNightBackgroundButton = this.builder.get_object('prefs_backgrounds_backgrounds_night_background_button');
        const nightBackgroundPreview = this.builder.get_object('night_background_preview');
        const updateBackgroundsBackgroundsNightBackgroundButtonUri = () => {
            backgroundsBackgroundsNightBackgroundButton.set_uri(this.settings.get_string('background-night'));
        };
        this.settings.connect('changed::background-night', () => updateBackgroundsBackgroundsNightBackgroundButtonUri());
        backgroundsBackgroundsNightBackgroundButton.connect('update-preview', () => {
            const file = backgroundsBackgroundsNightBackgroundButton.get_preview_filename();
            const allowedContentTypes = ['image/jpeg', 'image/png', 'image/tiff'];
            if (allowedContentTypes.includes(Gio.content_type_guess(file, null)[0])) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(file, 256, 256);
                nightBackgroundPreview.set_from_pixbuf(pixbuf);
            }
        });
        backgroundsBackgroundsNightBackgroundButton.connect('file-set', () => {
            this.settings.set_string('background-night', backgroundsBackgroundsNightBackgroundButton.get_uri());
        });
        updateBackgroundsBackgroundsNightBackgroundButtonUri();
    }

    _connectCommandsPreferences() {
        const commandsSwitchCommandsSwitch = this.builder.get_object('prefs_commands_switch_commands_switch');
        this.settings.bind(
            'commands-enabled',
            commandsSwitchCommandsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        const commandsCommands = this.builder.get_object('prefs_commands_commands');
        this.settings.bind(
            'commands-enabled',
            commandsCommands,
            'sensitive',
            Gio.SettingsBindFlags.DEFAULT
        );

        const commandsCommandsSunriseCommandEntry = this.builder.get_object('prefs_commands_commands_sunrise_command_entry');
        this.settings.bind(
            'command-sunrise',
            commandsCommandsSunriseCommandEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );

        const commandsCommandsSunsetCommandEntry = this.builder.get_object('prefs_commands_commands_sunset_command_entry');
        this.settings.bind(
            'command-sunset',
            commandsCommandsSunsetCommandEntry,
            'text',
            Gio.SettingsBindFlags.DEFAULT
        );
    }

    _connectOndemandKeyboardShortcutDialog() {
        const ondemandKeyboardShortcutDialog = this.builder.get_object('ondemand_keyboard_shortcut_dialog');
        ondemandKeyboardShortcutDialog.connect('key-press-event', (_widget, event) => {
            const state = event.get_state()[1];
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~Gdk.ModifierType.LOCK_MASK;
            const keycode = event.get_keycode()[1];
            const eventKeyval = event.get_keyval()[1];
            let keyval = Gdk.keyval_to_lower(eventKeyval);

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                ondemandKeyboardShortcutDialog.visible = false;
                return Gdk.EVENT_STOP;
            }

            if (keyval === Gdk.KEY_ISO_Left_Tab)
                keyval = Gdk.KEY_Tab;

            if (keyval !== eventKeyval)
                mask |= Gdk.ModifierType.SHIFT_MASK;

            if (keyval === Gdk.KEY_Sys_Req && (mask & Gdk.ModifierType.MOD1_MASK) !== 0)
                keyval = Gdk.KEY_Print;

            if (
                !utils.isBindingValid({ mask, keycode, keyval }) ||
                !utils.isAccelValid({ mask, keyval })
            )
                return Gdk.EVENT_STOP;

            const binding = Gtk.accelerator_name_with_keycode(
                null,
                keyval,
                keycode,
                mask
            );
            this.settings.set_strv('nightthemeswitcher-ondemand-keybinding', [binding]);
            ondemandKeyboardShortcutDialog.visible = false;
            return Gdk.EVENT_STOP;
        });

        const ondemandKeyboardShortcutDialogCancelButton = this.builder.get_object('ondemand_keyboard_shortcut_dialog_cancel_button');
        ondemandKeyboardShortcutDialogCancelButton.connect('clicked', () => {
            ondemandKeyboardShortcutDialog.visible = false;
        });
    }

};
