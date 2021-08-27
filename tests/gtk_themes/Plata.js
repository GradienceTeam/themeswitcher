// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-Compact'].forEach(size => {
    test(`Plata${size}`, t => {
        const variants = Variants.guessFrom(`Plata${size}`);
        t.is(variants.get(Time.DAY), `Plata${size}`);
        t.is(variants.get(Time.NIGHT), `Plata-Noir${size}`);
    });

    test(`Plata-Noir${size}`, t => {
        const variants = Variants.guessFrom(`Plata-Noir${size}`);
        t.is(variants.get(Time.DAY), `Plata${size}`);
        t.is(variants.get(Time.NIGHT), `Plata-Noir${size}`);
    });

    test(`Plata-Lumine${size}`, t => {
        const variants = Variants.guessFrom(`Plata-Lumine${size}`);
        t.is(variants.get(Time.DAY), `Plata-Lumine${size}`);
        t.is(variants.get(Time.NIGHT), `Plata-Noir${size}`);
    });
});
