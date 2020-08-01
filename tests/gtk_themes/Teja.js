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

test('Teja', t => {
    const variants = Variants.guessFrom('Teja');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Dark');
});

test('Teja_Dark', t => {
    const variants = Variants.guessFrom('Teja_Dark');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Dark');
});

test('Teja_Darkest', t => {
    const variants = Variants.guessFrom('Teja_Darkest');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Darkest');
});

test('Teja_Black', t => {
    const variants = Variants.guessFrom('Teja_Black');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Black');
});

test('Teja_Light', t => {
    const variants = Variants.guessFrom('Teja_Light');
    t.is(variants.get('day'), 'Teja_Light');
    t.is(variants.get('night'), 'Teja_Dark');
});
