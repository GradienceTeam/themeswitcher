// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-solid'].forEach(transparency => {
    ['', '-alt'].forEach(alt => {
        test(`Mojave-light${transparency}${alt}`, t => {
            const variants = Variants.guessFrom(`Mojave-light${transparency}${alt}`);
            t.is(variants.get(Time.DAY), `Mojave-light${transparency}${alt}`);
            t.is(variants.get(Time.NIGHT), `Mojave-dark${transparency}${alt}`);
        });

        test(`Mojave-dark${transparency}${alt}`, t => {
            const variants = Variants.guessFrom(`Mojave-dark${transparency}${alt}`);
            t.is(variants.get(Time.DAY), `Mojave-light${transparency}${alt}`);
            t.is(variants.get(Time.NIGHT), `Mojave-dark${transparency}${alt}`);
        });
    });
});
