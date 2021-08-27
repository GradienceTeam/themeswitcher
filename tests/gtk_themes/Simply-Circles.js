// SPDX-FileCopyrightText: 2020, 2021 Romain Vigier <contact AT romainvigier.fr>
// SPDX-License-Identifier: GPL-3.0-or-later

const test = require('ava');
const { Time, Variants } = require('./_variants');


['', '_Blue', '_Cyan', '_Green', '_Orange', '_Purple'].forEach(color => {
    ['', '_Envolved'].forEach(variant => {
        test(`Simply_Circles${color}_Light${variant}`, t => {
            const variants = Variants.guessFrom(`Simply_Circles${color}_Light${variant}`);
            t.is(variants.get(Time.DAY), `Simply_Circles${color}_Light${variant}`);
            t.is(variants.get(Time.NIGHT), `Simply_Circles${color}_Dark${variant}`);
        });

        test(`Simply_Circles${color}${variant}`, t => {
            const variants = Variants.guessFrom(`Simply_Circles${color}_Dark${variant}`);
            t.is(variants.get(Time.DAY), `Simply_Circles${color}_Light${variant}`);
            t.is(variants.get(Time.NIGHT), `Simply_Circles${color}_Dark${variant}`);
        });
    });
});
