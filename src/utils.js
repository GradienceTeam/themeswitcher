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

const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;


var log_debug = function(message) {
	if ( config.debug ) {
		log(`[DEBUG] ${Me.metadata.name}: ${message}`);
	}
}

var log_error = function(error) {
	logError(error, Me.metadata.name);
	if ( error.message ) {
		main.notifyError(Me.metadata.name, error.message);
	}
}

var get_installed_themes = function() {
	const themes = new Set(['Adwaita', 'HighContrast', 'HighContrastInverse']);

	const data_dirs_paths = GLib.get_system_data_dirs().concat(GLib.get_user_data_dir());
	const themes_dirs_paths = data_dirs_paths.map(path => GLib.build_filenamev([path, 'themes']));
	themes_dirs_paths.push(GLib.build_filenamev([GLib.get_home_dir(), '.themes']));

	themes_dirs_paths.forEach(themes_dir_path => {
		const themes_dir = Gio.File.new_for_path(themes_dir_path);

		if ( themes_dir.query_file_type(Gio.FileQueryInfoFlags.NONE, null) !== Gio.FileType.DIRECTORY ) {
			return;
		}

		const theme_dirs_enumerator = themes_dir.enumerate_children('', Gio.FileQueryInfoFlags.NONE, null);

		while ( true ) {
			let theme_dir_info = theme_dirs_enumerator.next_file(null);

			if ( theme_dir_info === null ) {
				break;
			}

			const theme_dir = theme_dirs_enumerator.get_child(theme_dir_info);

			[0, Gtk.MINOR_VERSION].forEach(gtk_version => {
				if ( gtk_version % 2 ) {
					gtk_version += 1;
				}
				const css_file = Gio.File.new_for_path(GLib.build_filenamev([theme_dir.get_path(), `gtk-3.${gtk_version}`, 'gtk.css']));
				if ( css_file.query_exists(null) ) {
					themes.add(theme_dir.get_basename());
				}
			})
		}
		theme_dirs_enumerator.close(null);
	});

	return themes;
}

var is_theme_installed = function(theme) {
	return get_installed_themes().has(theme);
}
