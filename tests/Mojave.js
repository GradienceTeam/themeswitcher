const test = require('ava');
const { Variants } = require('./_variants');


['', '-solid'].forEach(transparency => {
	['', '-alt'].forEach(alt => {
		test(`Mojave-light${transparency}${alt}`, t => {
			const variants = Variants.guess_from(`Mojave-light${transparency}${alt}`);
			t.is(variants.day, `Mojave-light${transparency}${alt}`);
			t.is(variants.night, `Mojave-dark${transparency}${alt}`);
		});

		test(`Mojave-dark${transparency}${alt}`, t => {
			const variants = Variants.guess_from(`Mojave-dark${transparency}${alt}`);
			t.is(variants.day, `Mojave-light${transparency}${alt}`);
			t.is(variants.night, `Mojave-dark${transparency}${alt}`);
		});
	});
});
