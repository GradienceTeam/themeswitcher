// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['Amber', 'Aqua', 'Blue', 'Brown', 'Deepblue', 'Green', 'Grey', 'MATE', 'Orange', 'Pink', 'Purple', 'Red', 'Teal', 'Yellow'].forEach(color => {
    test(`Yaru-${color}`, t => {
        const variants = Variants.guessFrom(`Yaru-${color}`);
        t.is(variants.get(Time.DAY), `Yaru-${color}`);
        t.is(variants.get(Time.NIGHT), `Yaru-${color}-dark`);
    });

    test(`Yaru-${color}-dark`, t => {
        const variants = Variants.guessFrom(`Yaru-${color}-dark`);
        t.is(variants.get(Time.DAY), `Yaru-${color}`);
        t.is(variants.get(Time.NIGHT), `Yaru-${color}-dark`);
    });

    test(`Yaru-${color}-light`, t => {
        const variants = Variants.guessFrom(`Yaru-${color}-light`);
        t.is(variants.get(Time.DAY), `Yaru-${color}-light`);
        t.is(variants.get(Time.NIGHT), `Yaru-${color}-dark`);
    });
});
