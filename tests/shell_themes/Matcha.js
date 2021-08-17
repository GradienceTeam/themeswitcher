// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['aliz', 'azul', 'sea'].forEach(color => {
    test(`Matcha-${color}`, t => {
        const variants = Variants.guessFrom(`Matcha-${color}`);
        t.is(variants.get('day'), `Matcha-${color}`);
        t.is(variants.get('night'), `Matcha-dark-${color}`);
    });

    test(`Matcha-dark-${color}`, t => {
        const variants = Variants.guessFrom(`Matcha-dark-${color}`);
        t.is(variants.get('day'), `Matcha-${color}`);
        t.is(variants.get('night'), `Matcha-dark-${color}`);
    });

    test(`Matcha-light-${color}`, t => {
        const variants = Variants.guessFrom(`Matcha-light-${color}`);
        t.is(variants.get('day'), `Matcha-light-${color}`);
        t.is(variants.get('night'), `Matcha-dark-${color}`);
    });
});
