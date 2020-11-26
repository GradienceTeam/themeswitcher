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

const { GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { compat, utils } = Me.imports;
const { Preferences } = Me.imports.preferences.Preferences;


/**
 * Initialize the preferences.
 */
function init() {
    compat.initTranslations(Me.metadata.uuid);
    const iconTheme = Gtk.IconTheme.get_default();
    iconTheme.append_search_path(GLib.build_filenamev([Me.path, 'icons']));
}

/**
 * Build the preferences widget.
 */
function buildPrefsWidget() {
    const preferences = new Preferences();
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
        const window = preferences.widget.get_toplevel();
        window.resize(600, 200);
        window.set_titlebar(preferences.headerbar);
    });
    return preferences.widget;
}
