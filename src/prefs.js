// SPDX-FileCopyrightText: 2020-2022 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

'use strict';

const { Adw, Gdk, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const _ = extensionUtils.gettext;

const { BackgroundsPage } = Me.imports.preferences.BackgroundsPage;
const { CommandsPage } = Me.imports.preferences.CommandsPage;
const { ContributePage } = Me.imports.preferences.ContributePage;
const { SchedulePage } = Me.imports.preferences.SchedulePage;
const { ThemesPage } = Me.imports.preferences.ThemesPage;

const { BackgroundButton } = Me.imports.preferences.BackgroundButton;
const { ClearableEntry } = Me.imports.preferences.ClearableEntry;
const { ShortcutButton } = Me.imports.preferences.ShortcutButton;
const { TimeChooser } = Me.imports.preferences.TimeChooser;


/**
 * Initialize the preferences.
 */
function init() {
    extensionUtils.initTranslations();

    const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
    iconTheme.add_search_path(GLib.build_filenamev([Me.path, 'icons']));
}

/**
 * Fill the PreferencesWindow.
 *
 * @param {Adw.PreferencesWindow} window The PreferencesWindow to fill.
 */
function fillPreferencesWindow(window) {
    [
        new SchedulePage(),
        new BackgroundsPage(),
        new CommandsPage(),
        new ThemesPage(),
        new ContributePage(),
    ].forEach(page => window.add(page));
    window.search_enabled = true;
    window.set_default_size(720, 490);
}
