// SPDX-FileCopyrightText: 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['Blue', 'Green', 'Grey', 'Orange', 'Purple', 'Red'].forEach(color => {
    test(`Zorin${color}-Light`, t => {
        const variants = Variants.guessFrom(`Zorin${color}-Light`);
        t.is(variants.get(Time.DAY), `Zorin${color}-Light`);
        t.is(variants.get(Time.NIGHT), `Zorin${color}-Dark`);
    });

    test(`Zorin${color}-Dark`, t => {
        const variants = Variants.guessFrom(`Zorin${color}-Dark`);
        t.is(variants.get(Time.DAY), `Zorin${color}-Light`);
        t.is(variants.get(Time.NIGHT), `Zorin${color}-Dark`);
    });
});
