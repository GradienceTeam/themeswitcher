const test = require('ava');
const { Variants } = require('./_variants');


['', '-laptop'].forEach(size => {
	['', '-beryl', '-doder', '-ruby'].forEach(color => {
		// TODO: Fix laptop implementation
		test.skip(`Vimix${size}${color}`, t => {
			const variants = Variants.guess_from(`Vimix${size}${color}`);
			t.is(variants.day, `Vimix${size}${color}`);
			t.is(variants.night, `Vimix-dark${size}${color}`);
		});

		test.skip(`Vimix-dark${size}${color}`, t => {
			const variants = Variants.guess_from(`Vimix-dark${size}${color}`);
			t.is(variants.day, `Vimix${size}${color}`);
			t.is(variants.night, `Vimix-dark${size}${color}`);
		});
		test.skip(`Vimix-light${size}${color}`, t => {
			const variants = Variants.guess_from(`Vimix-light${size}${color}`);
			t.is(variants.day, `Vimix-light${size}${color}`);
			t.is(variants.night, `Vimix-dark${size}${color}`);
		});
	});
});
