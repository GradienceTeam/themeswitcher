const test = require('ava');
const { Variants } = require('./_variants');


['', '-manjaro', '-ubuntu'].forEach(color => {
	['', '-win'].forEach(alt => {
		test(`Qogir${color}${alt}`, t => {
			const variants = Variants.guess_from(`Qogir${color}${alt}`);
			t.is(variants.day, `Qogir${color}${alt}`);
			t.is(variants.night, `Qogir${color}${alt}-dark`);
		});

		test(`Qogir${color}${alt}-dark`, t => {
			const variants = Variants.guess_from(`Qogir${color}${alt}-dark`);
			t.is(variants.day, `Qogir${color}${alt}`);
			t.is(variants.night, `Qogir${color}${alt}-dark`);
		});

		test(`Qogir${color}${alt}light`, t => {
			const variants = Variants.guess_from(`Qogir${color}${alt}-light`);
			t.is(variants.day, `Qogir${color}${alt}-light`);
			t.is(variants.night, `Qogir${color}${alt}-dark`);
		});
	});
});
