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

const { extensionUtils } = imports.misc;
const { main } = imports.ui;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

const { Nightlighter } = Me.imports.modules.Nightlighter;
const { Themer } = Me.imports.modules.Themer;
const { Variants } = Me.imports.modules.Variants;


var Switcher = class {

	constructor() {
		extensionUtils.initTranslations(config.EXT_UUID);
	}

	enable() {
		try {
			this.theme = new Themer();
			this.variants = Variants.guess_from(this.theme.current);
			this.theme.listen(this._on_theme_change.bind(this));

			this.nightlight = new Nightlighter();
			this.nightlight.listen(this._apply_theme_variant.bind(this));

			this._apply_theme_variant();
		}
		catch(e) {
			main.notifyError(config.EXT_NAME, e.message);
		}
	}

	disable() {
		try {
			this.theme.current = this.variants.original;
			this.theme.stop_listening();
			this.nightlight.stop_listening();
		}
		catch(e) {}
		finally {
			this.theme = null;
			this.variants = null;
			this.nightlight = null;
		}
	}

	_apply_theme_variant() {
		this.theme.current = this.nightlight.status ? this.variants.night : this.variants.day;
	}

	_on_theme_change() {
		const new_theme = this.theme.current;
		if ( new_theme === this.variants.day || new_theme === this.variants.night ) return;

		this.variants = Variants.guess_from(new_theme);
		this._apply_theme_variant();
	}

}
