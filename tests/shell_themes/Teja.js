// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('Teja', t => {
    const variants = Variants.guessFrom('Teja');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Dark');
});

test('Teja_Dark', t => {
    const variants = Variants.guessFrom('Teja_Dark');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Dark');
});

test('Teja_Darkest', t => {
    const variants = Variants.guessFrom('Teja_Darkest');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Darkest');
});

test('Teja_Black', t => {
    const variants = Variants.guessFrom('Teja_Black');
    t.is(variants.get('day'), 'Teja');
    t.is(variants.get('night'), 'Teja_Black');
});

test('Teja_Light', t => {
    const variants = Variants.guessFrom('Teja_Light');
    t.is(variants.get('day'), 'Teja_Light');
    t.is(variants.get('night'), 'Teja_Dark');
});
