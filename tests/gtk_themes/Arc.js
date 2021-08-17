// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


test('Arc', t => {
    const variants = Variants.guessFrom('Arc');
    t.is(variants.get('day'), 'Arc');
    t.is(variants.get('night'), 'Arc-Dark');
});

test('Arc-Dark', t => {
    const variants = Variants.guessFrom('Arc-Dark');
    t.is(variants.get('day'), 'Arc');
    t.is(variants.get('night'), 'Arc-Dark');
});

test('Arc-Darker', t => {
    const variants = Variants.guessFrom('Arc-Darker');
    t.is(variants.get('day'), 'Arc-Darker');
    t.is(variants.get('night'), 'Arc-Dark');
});

test('Arc-Darker-solid', t => {
    const variants = Variants.guessFrom('Arc-Darker-solid');
    t.is(variants.get('day'), 'Arc-Darker-solid');
    t.is(variants.get('night'), 'Arc-Dark-solid');
});

test('Arc-Dark-solid', t => {
    const variants = Variants.guessFrom('Arc-Dark-solid');
    t.is(variants.get('day'), 'Arc-solid');
    t.is(variants.get('night'), 'Arc-Dark-solid');
});

test('Arc-solid', t => {
    const variants = Variants.guessFrom('Arc-solid');
    t.is(variants.get('day'), 'Arc-solid');
    t.is(variants.get('night'), 'Arc-Dark-solid');
});
