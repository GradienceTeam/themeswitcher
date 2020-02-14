const test = require('ava');
const { Variants } = require('./_variants');


['', '-laptop'].forEach(size => {
	['', '-beryl', '-doder', '-ruby'].forEach(color => {
		test(`vimix${size}${color}`, t => {
			const variants = Variants.guess_from(`vimix${size}${color}`);
			t.is(variants.day, `vimix${size}${color}`);
			t.is(variants.night, `vimix-dark${size}${color}`);
		});

		test(`vimix-dark${size}${color}`, t => {
			const variants = Variants.guess_from(`vimix-dark${size}${color}`);
			t.is(variants.day, `vimix${size}${color}`);
			t.is(variants.night, `vimix-dark${size}${color}`);
		});
		test(`vimix-light${size}${color}`, t => {
			const variants = Variants.guess_from(`vimix-light${size}${color}`);
			t.is(variants.day, `vimix-light${size}${color}`);
			t.is(variants.night, `vimix-dark${size}${color}`);
		});
	});
});
