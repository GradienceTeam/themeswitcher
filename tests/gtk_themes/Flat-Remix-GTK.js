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

const test = require('ava');
const { Variants } = require('./_variants');


['Blue', 'Green', 'Red', 'Yellow'].forEach(color => {
	test(`Flat-Remix-GTK-${color}`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark`);
	});

	test(`Flat-Remix-GTK-${color}-Dark`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Dark`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark`);
	});

	test(`Flat-Remix-GTK-${color}-Darker`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darker`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Darker`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark`);
	});

	test(`Flat-Remix-GTK-${color}-Darker-Solid`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darker-Solid`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Darker-Solid`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark-Solid`);
	});

	test(`Flat-Remix-GTK-${color}-Darkest`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darkest`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Darkest`);
	});

	test(`Flat-Remix-GTK-${color}-Darkest-NoBorder`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darkest-NoBorder`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Darkest-NoBorder`);
	});

	test(`Flat-Remix-GTK-${color}-Darkest-Solid`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darkest-Solid`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Solid`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Darkest-Solid`);
	});

	test(`Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Solid`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`);
	});

	test(`Flat-Remix-GTK-${color}-Dark-Solid`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Dark-Solid`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Solid`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark-Solid`);
	});

	test(`Flat-Remix-GTK-${color}-Solid`, t => {
		const variants = Variants.guess_from(`Flat-Remix-GTK-${color}-Solid`);
		t.is(variants.get('day'), `Flat-Remix-GTK-${color}-Solid`);
		t.is(variants.get('night'), `Flat-Remix-GTK-${color}-Dark-Solid`);
	});
});
