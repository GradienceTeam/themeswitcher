// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['Blue', 'Green', 'Grey', 'Orange', 'Purple', 'Red'].forEach(color => {
    test(`Zorin${color}-Light`, t => {
        const variants = Variants.guessFrom(`Zorin${color}-Light`);
        t.is(variants.get('day'), `Zorin${color}-Light`);
        t.is(variants.get('night'), `Zorin${color}-Dark`);
    });

    test(`Zorin${color}-Dark`, t => {
        const variants = Variants.guessFrom(`Zorin${color}-Dark`);
        t.is(variants.get('day'), `Zorin${color}-Light`);
        t.is(variants.get('night'), `Zorin${color}-Dark`);
    });
});
