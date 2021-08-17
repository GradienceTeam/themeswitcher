// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['', '-Slim'].forEach(size => {
    ['-blue', '-green', '-orange', '-purple', '-red', '-yellow'].forEach(color => {
        test(`Macwaita${color}${size}`, t => {
            const variants = Variants.guessFrom(`Macwaita${color}${size}`);
            t.is(variants.get('day'), `Macwaita${color}${size}`);
            t.is(variants.get('night'), `Macwaita-dark${color}${size}`);
        });

        test(`Macwaita-dark${color}${size}`, t => {
            const variants = Variants.guessFrom(`Macwaita-dark${color}${size}`);
            t.is(variants.get('day'), `Macwaita${color}${size}`);
            t.is(variants.get('night'), `Macwaita-dark${color}${size}`);
        });
    });
});
