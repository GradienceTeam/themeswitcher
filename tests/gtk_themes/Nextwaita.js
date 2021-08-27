// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');

test('Nextwaita', t => {
    const variants = Variants.guessFrom('Nextwaita-2.2');
    t.is(variants.get(Time.DAY), 'Nextwaita-2.2');
    t.is(variants.get(Time.NIGHT), 'Nextwaita-dark-2.2');
});

test('Nextwaita-dark', t => {
    const variants = Variants.guessFrom('Nextwaita-dark-2.2');
    t.is(variants.get(Time.DAY), 'Nextwaita-2.2');
    t.is(variants.get(Time.NIGHT), 'Nextwaita-dark-2.2');
});
