// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


test('Adwaita', t => {
    const variants = Variants.guessFrom('Adwaita');
    t.is(variants.get(Time.DAY), 'Adwaita');
    t.is(variants.get(Time.NIGHT), 'Adwaita-dark');
});

test('Adwaita-dark', t => {
    const variants = Variants.guessFrom('Adwaita-dark');
    t.is(variants.get(Time.DAY), 'Adwaita');
    t.is(variants.get(Time.NIGHT), 'Adwaita-dark');
});
