// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


test('Layan', t => {
    const variants = Variants.guessFrom('Layan');
    t.is(variants.get('day'), 'Layan');
    t.is(variants.get('night'), 'Layan-dark');
});

test('Layan-dark', t => {
    const variants = Variants.guessFrom('Layan-dark');
    t.is(variants.get('day'), 'Layan');
    t.is(variants.get('night'), 'Layan-dark');
});

test('Layan-light', t => {
    const variants = Variants.guessFrom('Layan-light');
    t.is(variants.get('day'), 'Layan-light');
    t.is(variants.get('night'), 'Layan-dark');
});

test('Layan-solid', t => {
    const variants = Variants.guessFrom('Layan-solid');
    t.is(variants.get('day'), 'Layan-solid');
    t.is(variants.get('night'), 'Layan-dark-solid');
});

test('Layan-dark-solid', t => {
    const variants = Variants.guessFrom('Layan-dark-solid');
    t.is(variants.get('day'), 'Layan-solid');
    t.is(variants.get('night'), 'Layan-dark-solid');
});

test('Layan-light-solid', t => {
    const variants = Variants.guessFrom('Layan-light-solid');
    t.is(variants.get('day'), 'Layan-light-solid');
    t.is(variants.get('night'), 'Layan-dark-solid');
});
