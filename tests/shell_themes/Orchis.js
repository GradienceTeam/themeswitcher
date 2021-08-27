// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-compact'].forEach(size => {
    test(`Orchis${size}`, t => {
        const variants = Variants.guessFrom(`Orchis${size}`);
        t.is(variants.get(Time.DAY), `Orchis${size}`);
        t.is(variants.get(Time.NIGHT), `Orchis-dark${size}`);
    });

    test(`Orchis-dark${size}`, t => {
        const variants = Variants.guessFrom(`Orchis-dark${size}`);
        t.is(variants.get(Time.DAY), `Orchis${size}`);
        t.is(variants.get(Time.NIGHT), `Orchis-dark${size}`);
    });
});
