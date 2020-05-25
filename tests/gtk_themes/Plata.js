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


['', '-Compact'].forEach(size => {
	test(`Plata${size}`, t => {
		const variants = Variants.guess_from(`Plata${size}`);
		t.is(variants.get('day'), `Plata${size}`);
		t.is(variants.get('night'), `Plata-Noir${size}`);
	});

	test(`Plata-Noir${size}`, t => {
		const variants = Variants.guess_from(`Plata-Noir${size}`);
		t.is(variants.get('day'), `Plata${size}`);
		t.is(variants.get('night'), `Plata-Noir${size}`);
	});

	test(`Plata-Lumine${size}`, t => {
		const variants = Variants.guess_from(`Plata-Lumine${size}`);
		t.is(variants.get('day'), `Plata-Lumine${size}`);
		t.is(variants.get('night'), `Plata-Noir${size}`);
	});
})
