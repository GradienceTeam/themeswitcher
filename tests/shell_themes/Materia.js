// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-compact'].forEach(size => {
    test(`Materia${size}`, t => {
        const variants = Variants.guessFrom(`Materia${size}`);
        t.is(variants.get(Time.DAY), `Materia${size}`);
        t.is(variants.get(Time.NIGHT), `Materia-dark${size}`);
    });

    test(`Materia-dark${size}`, t => {
        const variants = Variants.guessFrom(`Materia-dark${size}`);
        t.is(variants.get(Time.DAY), `Materia${size}`);
        t.is(variants.get(Time.NIGHT), `Materia-dark${size}`);
    });

    test(`Materia-light${size}`, t => {
        const variants = Variants.guessFrom(`Materia-light${size}`);
        t.is(variants.get(Time.DAY), `Materia-light${size}`);
        t.is(variants.get(Time.NIGHT), `Materia-dark${size}`);
    });
});
