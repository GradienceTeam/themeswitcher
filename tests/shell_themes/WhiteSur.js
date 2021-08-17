// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');


['', '-solid'].forEach(transparency => {
    ['', '-alt'].forEach(alt => {
        test(`WhiteSur-light${transparency}${alt}`, t => {
            const variants = Variants.guessFrom(`WhiteSur-light${transparency}${alt}`);
            t.is(variants.get('day'), `WhiteSur-light${transparency}${alt}`);
            t.is(variants.get('night'), `WhiteSur-dark${transparency}${alt}`);
        });

        test(`WhiteSur-dark${transparency}${alt}`, t => {
            const variants = Variants.guessFrom(`WhiteSur-dark${transparency}${alt}`);
            t.is(variants.get('day'), `WhiteSur-light${transparency}${alt}`);
            t.is(variants.get('night'), `WhiteSur-dark${transparency}${alt}`);
        });
    });
});
