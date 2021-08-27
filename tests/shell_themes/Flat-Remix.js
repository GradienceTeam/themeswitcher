// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');

['', '-Miami'].forEach(color => {
    ['', '-fullPanel'].forEach(size => {
        test(`Flat-Remix${color}${size}`, t => {
            const variants = Variants.guessFrom(`Flat-Remix${color}${size}`);
            t.is(variants.get(Time.DAY), `Flat-Remix${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Flat-Remix${color}-Dark${size}`);
        });

        test(`Flat-Remix${color}-Dark${size}`, t => {
            const variants = Variants.guessFrom(`Flat-Remix${color}-Dark${size}`);
            t.is(variants.get(Time.DAY), `Flat-Remix${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Flat-Remix${color}-Dark${size}`);
        });

        test(`Flat-Remix${color}-Darkest${size}`, t => {
            const variants = Variants.guessFrom(`Flat-Remix${color}-Darkest${size}`);
            t.is(variants.get(Time.DAY), `Flat-Remix${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Flat-Remix${color}-Darkest${size}`);
        });
    });
});
