// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


test('Adapta', t => {
    const variants = Variants.guessFrom('Adapta');
    t.is(variants.get('day'), 'Adapta');
    t.is(variants.get('night'), 'Adapta-Nokto');
});

test('Adapta-Nokto', t => {
    const variants = Variants.guessFrom('Adapta-Nokto');
    t.is(variants.get('day'), 'Adapta');
    t.is(variants.get('night'), 'Adapta-Nokto');
});

test('Adapta-Eta', t => {
    const variants = Variants.guessFrom('Adapta-Eta');
    t.is(variants.get('day'), 'Adapta-Eta');
    t.is(variants.get('night'), 'Adapta-Nokto-Eta');
});

test('Adapta-Nokto-Eta', t => {
    const variants = Variants.guessFrom('Adapta-Nokto-Eta');
    t.is(variants.get('day'), 'Adapta-Eta');
    t.is(variants.get('night'), 'Adapta-Nokto-Eta');
});
