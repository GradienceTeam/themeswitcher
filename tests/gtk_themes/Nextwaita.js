// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('Nextwaita', t => {
    const variants = Variants.guessFrom('Nextwaita-2.2');
    t.is(variants.get('day'), 'Nextwaita-2.2');
    t.is(variants.get('night'), 'Nextwaita-dark-2.2');
});

test('Nextwaita-dark', t => {
    const variants = Variants.guessFrom('Nextwaita-dark-2.2');
    t.is(variants.get('day'), 'Nextwaita-2.2');
    t.is(variants.get('night'), 'Nextwaita-dark-2.2');
});
