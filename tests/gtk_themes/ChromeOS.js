// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');

['', '-compact'].forEach(size => {
    test(`ChromeOS${size}`, t => {
        const variants = Variants.guessFrom(`ChromeOS${size}`);
        t.is(variants.get(Time.DAY), `ChromeOS${size}`);
        t.is(variants.get(Time.NIGHT), `ChromeOS-dark${size}`);
    });

    test(`ChromeOS-dark${size}`, t => {
        const variants = Variants.guessFrom(`ChromeOS-dark${size}`);
        t.is(variants.get(Time.DAY), `ChromeOS${size}`);
        t.is(variants.get(Time.NIGHT), `ChromeOS-dark${size}`);
    });

    test(`ChromeOS-light${size}`, t => {
        const variants = Variants.guessFrom(`ChromeOS-light${size}`);
        t.is(variants.get(Time.DAY), `ChromeOS-light${size}`);
        t.is(variants.get(Time.NIGHT), `ChromeOS-dark${size}`);
    });
});
