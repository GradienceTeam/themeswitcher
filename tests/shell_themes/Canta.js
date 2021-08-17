// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['', '-blue', '-indigo'].forEach(color => {
    test(`Canta${color}`, t => {
        const variants = Variants.guessFrom(`Canta${color}`);
        t.is(variants.get('day'), `Canta${color}`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-dark`, t => {
        const variants = Variants.guessFrom(`Canta${color}-dark`);
        t.is(variants.get('day'), `Canta${color}`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-light`, t => {
        const variants = Variants.guessFrom(`Canta${color}-light`);
        t.is(variants.get('day'), `Canta${color}-light`);
        t.is(variants.get('night'), `Canta${color}-dark`);
    });

    test(`Canta${color}-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-compact`);
        t.is(variants.get('day'), `Canta${color}-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });

    test(`Canta${color}-dark-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-dark-compact`);
        t.is(variants.get('day'), `Canta${color}-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });

    test(`Canta${color}-light-compact`, t => {
        const variants = Variants.guessFrom(`Canta${color}-light-compact`);
        t.is(variants.get('day'), `Canta${color}-light-compact`);
        t.is(variants.get('night'), `Canta${color}-dark-compact`);
    });
});
