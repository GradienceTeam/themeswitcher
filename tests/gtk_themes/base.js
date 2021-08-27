// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');

test('base', t => {
    const variants = Variants.guessFrom('base');
    t.is(variants.get(Time.DAY), 'base');
    t.is(variants.get(Time.NIGHT), 'base-dark');
});

test('base-dark', t => {
    const variants = Variants.guessFrom('base-dark');
    t.is(variants.get(Time.DAY), 'base');
    t.is(variants.get(Time.NIGHT), 'base-dark');
});

test('base-light', t => {
    const variants = Variants.guessFrom('base-light');
    t.is(variants.get(Time.DAY), 'base-light');
    t.is(variants.get(Time.NIGHT), 'base-dark');
});

test('base-darker', t => {
    const variants = Variants.guessFrom('base-darker');
    t.is(variants.get(Time.DAY), 'base-darker');
    t.is(variants.get(Time.NIGHT), 'base-dark');
});

test('base-darkest', t => {
    const variants = Variants.guessFrom('base-darkest');
    t.is(variants.get(Time.DAY), 'base');
    t.is(variants.get(Time.NIGHT), 'base-darkest');
});
