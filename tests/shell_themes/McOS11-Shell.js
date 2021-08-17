// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('McOS11-Shell', t => {
    const variants = Variants.guessFrom('mcOS11-Shell');
    t.is(variants.get('day'), 'mcOS11-Shell');
    t.is(variants.get('night'), 'mcOS11-Shell-Dark');
});

test('McOS11-Shell-Dark', t => {
    const variants = Variants.guessFrom('mcOS11-Shell-Dark');
    t.is(variants.get('day'), 'mcOS11-Shell');
    t.is(variants.get('night'), 'mcOS11-Shell-Dark');
});
