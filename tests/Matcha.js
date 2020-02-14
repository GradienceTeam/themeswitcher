const test = require('ava');
const { Variants } = require('./_variants');


['aliz', 'azul', 'sea'].forEach(color => {
	test(`Matcha-${color}`, t => {
		const variants = Variants.guess_from(`Matcha-${color}`);
		t.is(variants.day, `Matcha-${color}`);
		t.is(variants.night, `Matcha-dark-${color}`);
	});

	test(`Matcha-dark-${color}`, t => {
		const variants = Variants.guess_from(`Matcha-dark-${color}`);
		t.is(variants.day, `Matcha-${color}`);
		t.is(variants.night, `Matcha-dark-${color}`);
	});

	// TODO: Implement light variant
	test.skip(`Matcha-light-${color}`, t => {
		const variants = Variants.guess_from(`Matcha-light-${color}`);
		t.is(variants.day, `Matcha-light-${color}`);
		t.is(variants.night, `Matcha-dark-${color}`);
	});
})
