// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Variants } = require('./_variants');

test('McOS-CTLina-Gnome-1.3.2', t => {
    const variants = Variants.guessFrom('McOS-CTLina-Gnome-1.3.2');
    t.is(variants.get('day'), 'McOS-CTLina-Gnome-1.3.2');
    t.is(variants.get('night'), 'Mc-OS-CTLina-Gnome-Dark-1.3.2');
});

test('Mc-OS-CTLina-Gnome-Dark-1.3.2', t => {
    const variants = Variants.guessFrom('Mc-OS-CTLina-Gnome-Dark-1.3.2');
    t.is(variants.get('day'), 'McOS-CTLina-Gnome-1.3.2');
    t.is(variants.get('night'), 'Mc-OS-CTLina-Gnome-Dark-1.3.2');
});
