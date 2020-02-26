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

var EXT_NAME = 'Night Theme Switcher';
var EXT_UUID = 'nightthemeswitcher@romainvigier.fr';

var THEME_GSETTINGS_SCHEMA = 'org.gnome.desktop.interface';
var THEME_GSETTINGS_PROPERTY = 'gtk-theme';

var NIGHTLIGHT_GSETTINGS_SCHEMA = 'org.gnome.settings-daemon.plugins.color';
var NIGHTLIGHT_GSETTINGS_PROPERTY = 'night-light-enabled';

var debug = false;
