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


['', '-blue', '-indigo'].forEach(color => {
    test(`Canta${color}`, t => {
        const variants = Variants.guessFrom(`Canta${color}`);
        t.is(variants.get('day'), `Canta${color}`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-dark`, t => {
        const variants = Variants.guessFrom(`Canta${color}-dark`);
        t.is(variants.get('day'), `Canta${color}`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-light`, t => {
        const variants = Variants.guessFrom(`Canta${color}-light`);
        t.is(variants.get('day'), `Canta${color}-light`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-compact`);
        t.is(variants.get('day'), `Canta${color}-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });

    test(`Canta${color}-dark-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-dark-compact`);
        t.is(variants.get('day'), `Canta${color}-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });

    test(`Canta${color}-light-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-light-compact`);
        t.is(variants.get('day'), `Canta${color}-light-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });
});
