// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['', '-manjaro', '-ubuntu'].forEach(color => {
    ['', '-win'].forEach(alt => {
        test(`Qogir${color}${alt}`, t => {
            const variants = Variants.guessFrom(`Qogir${color}${alt}`);
            t.is(variants.get('day'), `Qogir${color}${alt}`);
            t.is(variants.get('night'), `Qogir${color}${alt}-dark`);
        });

        test(`Qogir${color}${alt}-dark`, t => {
            const variants = Variants.guessFrom(`Qogir${color}${alt}-dark`);
            t.is(variants.get('day'), `Qogir${color}${alt}`);
            t.is(variants.get('night'), `Qogir${color}${alt}-dark`);
        });

        test(`Qogir${color}${alt}light`, t => {
            const variants = Variants.guessFrom(`Qogir${color}${alt}-light`);
            t.is(variants.get('day'), `Qogir${color}${alt}-light`);
            t.is(variants.get('night'), `Qogir${color}${alt}-dark`);
        });
    });
});
