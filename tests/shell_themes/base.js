// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('base', t => {
    const variants = Variants.guessFrom('base');
    t.is(variants.get('day'), 'base');
    t.is(variants.get('night'), 'base-dark');
});

test('base-dark', t => {
    const variants = Variants.guessFrom('base-dark');
    t.is(variants.get('day'), 'base');
    t.is(variants.get('night'), 'base-dark');
});

test('base-light', t => {
    const variants = Variants.guessFrom('base-light');
    t.is(variants.get('day'), 'base-light');
    t.is(variants.get('night'), 'base-dark');
});

test('base-darker', t => {
    const variants = Variants.guessFrom('base-darker');
    t.is(variants.get('day'), 'base-darker');
    t.is(variants.get('night'), 'base-dark');
});

test('base-darkest', t => {
    const variants = Variants.guessFrom('base-darkest');
    t.is(variants.get('day'), 'base');
    t.is(variants.get('night'), 'base-darkest');
});
