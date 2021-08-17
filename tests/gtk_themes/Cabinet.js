// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['Blue', 'Green', 'Orange'].forEach(color => {
    test(`Cabinet-${color}`, t => {
        const variants = Variants.guessFrom(`Cabinet-Light-${color}`);
        t.is(variants.get('day'), `Cabinet-Light-${color}`);
        t.is(variants.get('night'), `Cabinet-Dark-${color}`);
    });

    test(`Cabinet-Dark-${color}`, t => {
        const variants = Variants.guessFrom(`Cabinet-Dark-${color}`);
        t.is(variants.get('day'), `Cabinet-Light-${color}`);
        t.is(variants.get('night'), `Cabinet-Dark-${color}`);
    });

    test(`Cabinet-Darker-${color}`, t => {
        const variants = Variants.guessFrom(`Cabinet-Darker-${color}`);
        t.is(variants.get('day'), `Cabinet-Darker-${color}`);
        t.is(variants.get('night'), `Cabinet-Dark-${color}`);
    });
});
