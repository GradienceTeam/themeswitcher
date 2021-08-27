// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


test('Prof-Gnome-Light-3', t => {
    const variants = Variants.guessFrom('Prof-Gnome-Light-3');
    t.is(variants.get(Time.DAY), 'Prof-Gnome-Light-3');
    t.is(variants.get(Time.NIGHT), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Dark-3', t => {
    const variants = Variants.guessFrom('Prof-Gnome-Dark-3');
    t.is(variants.get(Time.DAY), 'Prof-Gnome-Light-3');
    t.is(variants.get(Time.NIGHT), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Darker-3', t => {
    const variants = Variants.guessFrom('Prof-Gnome-Darker-3');
    t.is(variants.get(Time.DAY), 'Prof-Gnome-Darker-3');
    t.is(variants.get(Time.NIGHT), 'Prof-Gnome-Dark-3');
});

test('Prof-Gnome-Light-DS-3', t => {
    const variants = Variants.guessFrom('Prof-Gnome-Light-DS-3');
    t.is(variants.get(Time.DAY), 'Prof-Gnome-Light-DS-3');
    t.is(variants.get(Time.NIGHT), 'Prof-Gnome-Dark-3');
});
