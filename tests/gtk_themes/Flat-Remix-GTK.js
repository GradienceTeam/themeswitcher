// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['Blue', 'Green', 'Red', 'Yellow'].forEach(color => {
    test(`Flat-Remix-GTK-${color}`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark`);
    });

    test(`Flat-Remix-GTK-${color}-Dark`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Dark`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark`);
    });

    test(`Flat-Remix-GTK-${color}-Darker`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darker`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Darker`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark`);
    });

    test(`Flat-Remix-GTK-${color}-Darker-Solid`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darker-Solid`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Darker-Solid`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark-Solid`);
    });

    test(`Flat-Remix-GTK-${color}-Darkest`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darkest`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Darkest`);
    });

    test(`Flat-Remix-GTK-${color}-Darkest-NoBorder`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darkest-NoBorder`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Darkest-NoBorder`);
    });

    test(`Flat-Remix-GTK-${color}-Darkest-Solid`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darkest-Solid`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Solid`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Darkest-Solid`);
    });

    test(`Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Solid`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Darkest-Solid-NoBorder`);
    });

    test(`Flat-Remix-GTK-${color}-Dark-Solid`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Dark-Solid`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Solid`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark-Solid`);
    });

    test(`Flat-Remix-GTK-${color}-Solid`, t => {
        const variants = Variants.guessFrom(`Flat-Remix-GTK-${color}-Solid`);
        t.is(variants.get(Time.DAY), `Flat-Remix-GTK-${color}-Solid`);
        t.is(variants.get(Time.NIGHT), `Flat-Remix-GTK-${color}-Dark-Solid`);
    });
});
