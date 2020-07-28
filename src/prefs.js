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

const { Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const compat = Me.imports.compat;
const { BackgroundsPreferences } = Me.imports.preferences.Backgrounds;
const { CommandsPreferences } = Me.imports.preferences.Commands;
const { CursorThemePreferences } = Me.imports.preferences.CursorTheme;
const { GtkThemePreferences } = Me.imports.preferences.GtkTheme;
const { IconThemePreferences } = Me.imports.preferences.IconTheme;
const { SchedulePreferences } = Me.imports.preferences.Schedule;
const { ShellThemePreferences } = Me.imports.preferences.ShellTheme;


function init() {
	compat.init_translations(Me.metadata.uuid);
}

function buildPrefsWidget() {
	const prefs_widget = new Gtk.Notebook({
		visible: true
	});

	const schedulePreferences = new SchedulePreferences();
	prefs_widget.append_page(schedulePreferences.page, schedulePreferences.label);

	const gtkThemePreferences = new GtkThemePreferences();
	prefs_widget.append_page(gtkThemePreferences.page, gtkThemePreferences.label);

	const shellThemePreferences = new ShellThemePreferences();
	prefs_widget.append_page(shellThemePreferences.page, shellThemePreferences.label);

	const iconThemePreferences = new IconThemePreferences();
	prefs_widget.append_page(iconThemePreferences.page, iconThemePreferences.label);

	const cursorThemePreferences = new CursorThemePreferences();
	prefs_widget.append_page(cursorThemePreferences.page, cursorThemePreferences.label);

	const backgroundsPreferences = new BackgroundsPreferences();
	prefs_widget.append_page(backgroundsPreferences.page, backgroundsPreferences.label);

	const commandsPreferences = new CommandsPreferences();
	prefs_widget.append_page(commandsPreferences.page, commandsPreferences.label);

	prefs_widget.show_all();

	return prefs_widget;
}
