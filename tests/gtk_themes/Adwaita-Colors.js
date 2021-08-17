// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['blue', 'cyan', 'grass', 'gray', 'green', 'indigo', 'magenta', 'orange', 'pink', 'red', 'teal', 'violet', 'yellow'].forEach(color => {
    test(`Adwaita-${color}`, t => {
        const variants = Variants.guessFrom(`Adwaita-${color}`);
        t.is(variants.get('day'), `Adwaita-${color}`);
        t.is(variants.get('night'), `Adwaita-${color}-dark`);
    });

    test(`Adwaita-${color}-dark`, t => {
        const variants = Variants.guessFrom(`Adwaita-${color}-dark`);
        t.is(variants.get('day'), `Adwaita-${color}`);
        t.is(variants.get('night'), `Adwaita-${color}-dark`);
    });
});
