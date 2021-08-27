// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


test('HighContrast', t => {
    const variants = Variants.guessFrom('HighContrast');
    t.is(variants.get(Time.DAY), 'HighContrast');
    t.is(variants.get(Time.NIGHT), 'HighContrastInverse');
});

test('HighContrastInverse', t => {
    const variants = Variants.guessFrom('HighContrastInverse');
    t.is(variants.get(Time.DAY), 'HighContrast');
    t.is(variants.get(Time.NIGHT), 'HighContrastInverse');
});
