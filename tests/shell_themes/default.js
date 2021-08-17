// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('default', t => {
    const variants = Variants.guessFrom('');
    t.is(variants.get('day'), '');
    t.is(variants.get('night'), '');
});
