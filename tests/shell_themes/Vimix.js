// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['', '-laptop'].forEach(size => {
    ['', '-beryl', '-doder', '-ruby'].forEach(color => {
        test(`vimix${size}${color}`, t => {
            const variants = Variants.guessFrom(`vimix${size}${color}`);
            t.is(variants.get('day'), `vimix${size}${color}`);
            t.is(variants.get('night'), `vimix-dark${size}${color}`);
        });

        test(`vimix-dark${size}${color}`, t => {
            const variants = Variants.guessFrom(`vimix-dark${size}${color}`);
            t.is(variants.get('day'), `vimix${size}${color}`);
            t.is(variants.get('night'), `vimix-dark${size}${color}`);
        });
        test(`vimix-light${size}${color}`, t => {
            const variants = Variants.guessFrom(`vimix-light${size}${color}`);
            t.is(variants.get('day'), `vimix-light${size}${color}`);
            t.is(variants.get('night'), `vimix-dark${size}${color}`);
        });
    });
});
