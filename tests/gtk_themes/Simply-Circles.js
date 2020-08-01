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


['', '_Blue', '_Cyan', '_Green', '_Orange', '_Purple'].forEach(color => {
    ['', '_Envolved'].forEach(variant => {
        test(`Simply_Circles${color}_Light${variant}`, t => {
            const variants = Variants.guessFrom(`Simply_Circles${color}_Light${variant}`);
            t.is(variants.get('day'), `Simply_Circles${color}_Light${variant}`);
            t.is(variants.get('night'), `Simply_Circles${color}_Dark${variant}`);
        });

        test(`Simply_Circles${color}${variant}`, t => {
            const variants = Variants.guessFrom(`Simply_Circles${color}_Dark${variant}`);
            t.is(variants.get('day'), `Simply_Circles${color}_Light${variant}`);
            t.is(variants.get('night'), `Simply_Circles${color}_Dark${variant}`);
        });
    });
});
