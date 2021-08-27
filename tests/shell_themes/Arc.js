// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


test('Arc', t => {
    const variants = Variants.guessFrom('Arc');
    t.is(variants.get(Time.DAY), 'Arc');
    t.is(variants.get(Time.NIGHT), 'Arc-Dark');
});

test('Arc-Dark', t => {
    const variants = Variants.guessFrom('Arc-Dark');
    t.is(variants.get(Time.DAY), 'Arc');
    t.is(variants.get(Time.NIGHT), 'Arc-Dark');
});

test('Arc-Dark-solid', t => {
    const variants = Variants.guessFrom('Arc-Dark-solid');
    t.is(variants.get(Time.DAY), 'Arc-solid');
    t.is(variants.get(Time.NIGHT), 'Arc-Dark-solid');
});

test('Arc-solid', t => {
    const variants = Variants.guessFrom('Arc-solid');
    t.is(variants.get(Time.DAY), 'Arc-solid');
    t.is(variants.get(Time.NIGHT), 'Arc-Dark-solid');
});
