/*
Night Theme Switcher Gnome Shell extension

Copyright (C) 2019, 2020 Romain Vigier
Copyright (C) 2020 Matti Hyttinen

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


/*
The magic of guessing theme variants happens here.

If the theme doesn't fit a particular case, we'll do the following:
	- Remove any signs of a dark variant to the theme name to get the day
	variant
	- Remove any signs of a light variant to the day variant and add '-dark' to
	get the night variant

For themes that don't work with the general rule, a particular case must be
written. Day and night variants should be guessed with the most generic light
and dark variants the theme offer, except if the user explicitly chose a
specific variant.

Light variants, from the most to the least generic:
	- ''
	- '-light'
	- '-darker'

Dark variants, from the most the least generic:
	- '-dark'
	- '-darkest'
*/

var Variants = class {

	static guess_from(name) {
		const variants = {};
		variants.original = name;

		if ( name.includes('Adapta') ) {
			variants.day = name.replace('-Nokto', '');
			variants.night = variants.day.replace('Adapta', 'Adapta-Nokto');
		}
		else if ( name.includes('Arc') ) {
			variants.day = name.replace(/-Dark(?!er)/, '');
			variants.night = variants.day.replace(/Arc(-Darker)?/, 'Arc-Dark');
		}
		else if ( name.match(/^(Canta|Materia).*-compact/) ) {
			variants.day = name.replace('-dark', '');
			variants.night = variants.day.replace(/(-light)?-compact/, '-dark-compact');
		}
		else if ( name.includes('Flat-Remix-GTK') ) {
			const isSolid = name.includes('-Solid');
			const withoutBorder = name.includes('-NoBorder');
			const basename = name.split('-').slice(0, 4).join('-');
			variants.day = basename + (name.includes('-Darker') ? '-Darker' : '') + (isSolid ? '-Solid' : '');
			variants.night = basename + (name.includes('-Darkest') ? '-Darkest' : '-Dark') + (isSolid ? '-Solid' : '') + (withoutBorder ? '-NoBorder' : '');
		}
		else if ( name.includes('HighContrast') ) {
			variants.day = 'HighContrast';
			variants.night = 'HighContrastInverse';
		}
		else if ( name.match(/^(Layan|Matcha)/) ) {
			const basename = name.split('-')[0];
			variants.day = name.replace('-dark', '');
			variants.night = variants.day.replace(new RegExp(`${basename}(-light)?`), `${basename}-dark`);
		}
		else if ( name.includes('Mojave') ) {
			variants.day = name.replace('-dark', '-light');
			variants.night = variants.day.replace('-light', '-dark');
		}
		else if ( name.includes('vimix') ) {
			variants.day = name.replace('-dark', '');
			variants.night = variants.day.replace(/vimix(-light)?/, 'vimix-dark');
		}
		else {
			variants.day = name.replace(/-dark(?!er)(est)?/, '');
			variants.night = variants.day.replace(/(-light|-darker)/, '') + (name.includes('-darkest') ? '-darkest' : '-dark');
		}

		return variants;
	}

}
