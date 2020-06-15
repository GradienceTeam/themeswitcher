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

const Meta = imports.gi.Meta;

const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);


function key_binding_auto_repeat() {
	// if version is less then 3.30 the keybinding flags are NONE
	if (shell_minor_version < 30) {
		return Meta.KeyBindingFlags.NONE;
	}
	else {
		return Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;
	}
};


function get_actor(subject) {
	if (shell_minor_version > 34) {
		return subject;
	}
	else {
		return subject.actor;
	}
};
