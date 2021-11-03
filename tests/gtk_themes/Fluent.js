// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-green', '-grey', '-orange', '-pink', '-purple', '-red', '-teal', '-yellow'].forEach(color => {
    ['', '-compact'].forEach(size => {
        test(`Fluent${color}${size}`, t => {
            const variants = Variants.guessFrom(`Fluent${color}${size}`);
            t.is(variants.get(Time.DAY), `Fluent${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Fluent${color}-dark${size}`);
        });

        test(`Fluent${color}-light${size}`, t => {
            const variants = Variants.guessFrom(`Fluent${color}-light${size}`);
            t.is(variants.get(Time.DAY), `Fluent${color}-light${size}`);
            t.is(variants.get(Time.NIGHT), `Fluent${color}-dark${size}`);
        });
        test(`Fluent${color}-dark${size}`, t => {
            const variants = Variants.guessFrom(`Fluent${color}-dark${size}`);
            t.is(variants.get(Time.DAY), `Fluent${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Fluent${color}-dark${size}`);
        });
    });
});
