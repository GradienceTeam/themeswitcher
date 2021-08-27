// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '-Slim'].forEach(size => {
    ['-blue', '-green', '-orange', '-purple', '-red', '-yellow'].forEach(color => {
        test(`Macwaita${color}${size}`, t => {
            const variants = Variants.guessFrom(`Macwaita${color}${size}`);
            t.is(variants.get(Time.DAY), `Macwaita${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Macwaita-dark${color}${size}`);
        });

        test(`Macwaita-dark${color}${size}`, t => {
            const variants = Variants.guessFrom(`Macwaita-dark${color}${size}`);
            t.is(variants.get(Time.DAY), `Macwaita${color}${size}`);
            t.is(variants.get(Time.NIGHT), `Macwaita-dark${color}${size}`);
        });
    });
});
