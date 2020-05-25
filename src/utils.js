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

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;


const shell_minor_version = parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[1]);


/**
 * Output a debug message to the console if the debug config is active.
 * @param {string} message The message to log.
 */
function log_debug(message) {
	if (config.debug) {
		log(`[DEBUG] ${Me.metadata.name}: ${message}`);
	}
}

/**
 * Log an error and show a notification if it has a message.
 * @param {Error} error The error to log.
 */
function log_error(error) {
	if (config.debug) {
		logError(error, Me.metadata.name);
	}
	if ( error.message && imports.ui ) {
		imports.ui.main.notifyError(Me.metadata.name, error.message);
	}
}

/**
 * Get all the theme directories of the system.
 * @returns {string[]} An array of paths.
 */
function get_theme_dirs_paths() {
	return [
		GLib.build_filenamev([GLib.get_home_dir(), '.themes']),
		GLib.build_filenamev([GLib.get_user_data_dir(), 'themes']),
		...GLib.get_system_data_dirs().map(path => GLib.build_filenamev([path, 'themes']))
	];
}

/**
 * Get all the installed GTK themes on the system.
 * @returns {Set} A set containing all the installed GTK themes names.
 */
function get_installed_gtk_themes() {
	const themes = new Set(['Adwaita', 'HighContrast', 'HighContrastInverse']);

	get_theme_dirs_paths().forEach(themes_dir_path => {
		const themes_dir = Gio.File.new_for_path(themes_dir_path);

		if (themes_dir.query_file_type(Gio.FileQueryInfoFlags.NONE, null) !== Gio.FileType.DIRECTORY) {
			return;
		}

		const theme_dirs_enumerator = themes_dir.enumerate_children('', Gio.FileQueryInfoFlags.NONE, null);

		while (true) {
			let theme_dir_info = theme_dirs_enumerator.next_file(null);

			if (theme_dir_info === null) {
				break;
			}

			const theme_dir = theme_dirs_enumerator.get_child(theme_dir_info);

			[0, Gtk.MINOR_VERSION].forEach(gtk_version => {
				if (gtk_version % 2) {
					gtk_version += 1;
				}
				const css_file = Gio.File.new_for_path(GLib.build_filenamev([theme_dir.get_path(), `gtk-3.${gtk_version}`, 'gtk.css']));
				if (css_file.query_exists(null)) {
					themes.add(theme_dir.get_basename());
				}
			})
		}
		theme_dirs_enumerator.close(null);
	});

	return themes;
}

/**
 * Get all the installed shell themes on the system.
 * @returns {Set} A set containing all the installed shell themes names.
 */
function get_installed_shell_themes() {
	const themes = new Set(['']);

	get_theme_dirs_paths().forEach(themes_dir_path => {
		const themes_dir = Gio.File.new_for_path(themes_dir_path);

		if (themes_dir.query_file_type(Gio.FileQueryInfoFlags.NONE, null) !== Gio.FileType.DIRECTORY) {
			return;
		}

		const theme_dirs_enumerator = themes_dir.enumerate_children('', Gio.FileQueryInfoFlags.NONE, null);

		while (true) {
			let theme_dir_info = theme_dirs_enumerator.next_file(null);

			if (theme_dir_info === null) {
				break;
			}

			const theme_dir = theme_dirs_enumerator.get_child(theme_dir_info);
			const css_file = Gio.File.new_for_path(GLib.build_filenamev([theme_dir.get_path(), 'gnome-shell', 'gnome-shell.css']));
			if (css_file.query_exists(null)) {
				themes.add(theme_dir.get_basename());
			}
		}
		theme_dirs_enumerator.close(null);
	});

	return themes;
}

/**
 * Get the User Themes extension.
 * @returns {Object|undefined} The User Themes extension object or undefined if
 * it isn't installed.
 */
function get_userthemes_extension() {
	if ( shell_minor_version > 32 ) {
		return imports.ui.main.extensionManager.lookup('user-theme@gnome-shell-extensions.gcampax.github.com');
	}
	else {
		return extensionUtils.extensions['user-theme@gnome-shell-extensions.gcampax.github.com'];
	}
}

/**
 * Get the User Themes extension settings.
 * @returns {Gio.Settings|null} The User Themes extension settings or null if
 * the extension isn't installed.
 */
function get_userthemes_settings() {
	let extension = get_userthemes_extension();

	if ( !extension ) {
		return null;
	}

	const schema_dir = extension.dir.get_child('schemas');
	const GioSSS = Gio.SettingsSchemaSource;
	let schemaSource;
	if ( schema_dir.query_exists(null) ) {
		schemaSource = GioSSS.new_from_directory(schema_dir.get_path(), GioSSS.get_default(), false);
	}
	else {
		schemaSource = GioSSS.get_default();
	}
	const schemaObj = schemaSource.lookup('org.gnome.shell.extensions.user-theme', true);
	return new Gio.Settings({ settings_schema: schemaObj });
}

/**
 * Get the shell theme stylesheet.
 * @param {string} theme The shell theme name.
 * @returns {string} Path to the shell theme stylesheet.
 */
function get_shell_theme_stylesheet(theme) {
	log_debug('Getting the ' + (theme ? `'${theme}'` : 'default') + ' theme shell stylesheet...');
	let stylesheet = null;
	if ( theme ) {
		const stylesheet_paths = get_theme_dirs_paths().map(path => `${path}/${theme}/gnome-shell/gnome-shell.css`);
		stylesheet = stylesheet_paths.find(path => {
			let file = Gio.file_new_for_path(path);
			return file.query_exists(null);
		});
	}
	return stylesheet;
}

/**
 * Apply a stylesheet to the shell.
 * @param {string} stylesheet The shell stylesheet to apply.
 */
function apply_shell_stylesheet(stylesheet) {
	log_debug('Applying shell stylesheet...');
	imports.ui.main.setThemeStylesheet(stylesheet);
	imports.ui.main.loadTheme();
	log_debug('Shell stylesheet applied.');
}
