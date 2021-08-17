// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


test('HighContrast', t => {
    const variants = Variants.guessFrom('HighContrast');
    t.is(variants.get('day'), 'HighContrast');
    t.is(variants.get('night'), 'HighContrastInverse');
});

test('HighContrastInverse', t => {
    const variants = Variants.guessFrom('HighContrastInverse');
    t.is(variants.get('day'), 'HighContrast');
    t.is(variants.get('night'), 'HighContrastInverse');
});
