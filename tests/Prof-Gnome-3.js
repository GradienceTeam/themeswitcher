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


test('Prof-Gnome-Light-3', t => {
	const variants = Variants.guess_from('Prof-Gnome-Light-3');
	t.is(variants.get('day'), 'Prof-Gnome-Light-3');
	t.is(variants.get('night'), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Dark-3', t => {
	const variants = Variants.guess_from('Prof-Gnome-Dark-3');
	t.is(variants.get('day'), 'Prof-Gnome-Light-3');
	t.is(variants.get('night'), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Darker-3', t => {
	const variants = Variants.guess_from('Prof-Gnome-Darker-3');
	t.is(variants.get('day'), 'Prof-Gnome-Darker-3');
	t.is(variants.get('night'), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Light-DS-3', t => {
	const variants = Variants.guess_from('Prof-Gnome-Light-DS-3');
	t.is(variants.get('day'), 'Prof-Gnome-Light-DS-3');
	t.is(variants.get('night'), 'Prof-Gnome-Dark-3');
});
