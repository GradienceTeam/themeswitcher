// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


test('Yaru', t => {
    const variants = Variants.guessFrom('Yaru');
    t.is(variants.get(Time.DAY), 'Yaru');
    t.is(variants.get(Time.NIGHT), 'Yaru-dark');
});

test('Yaru-dark', t => {
    const variants = Variants.guessFrom('Yaru-dark');
    t.is(variants.get(Time.DAY), 'Yaru');
    t.is(variants.get(Time.NIGHT), 'Yaru-dark');
});

test('Yaru-light', t => {
    const variants = Variants.guessFrom('Yaru-light');
    t.is(variants.get(Time.DAY), 'Yaru-light');
    t.is(variants.get(Time.NIGHT), 'Yaru-dark');
});
