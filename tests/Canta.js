const test = require('ava');
const { Variants } = require('./_variants');


['', '-blue', '-indigo'].forEach(color => {
	test(`Canta${color}`, t => {
		const variants = Variants.guess_from(`Canta${color}`);
		t.is(variants.day, `Canta${color}`);
		t.is(variants.night, `Canta${color}-dark`);
	});

	test(`Canta${color}-dark`, t => {
		const variants = Variants.guess_from(`Canta${color}-dark`);
		t.is(variants.day, `Canta${color}`);
		t.is(variants.night, `Canta${color}-dark`);
	});

	test(`Canta${color}-light`, t => {
		const variants = Variants.guess_from(`Canta${color}-light`);
		t.is(variants.day, `Canta${color}-light`);
		t.is(variants.night, `Canta${color}-dark`);
	});

	test(`Canta${color}-compact`, t => {
		const variants = Variants.guess_from(`Canta${color}-compact`);
		t.is(variants.day, `Canta${color}-compact`);
		t.is(variants.night, `Canta${color}-dark-compact`);
	});

	test(`Canta${color}-dark-compact`, t => {
		const variants = Variants.guess_from(`Canta${color}-dark-compact`);
		t.is(variants.day, `Canta${color}-compact`);
		t.is(variants.night, `Canta${color}-dark-compact`);
	});

	test(`Canta${color}-light-compact`, t => {
		const variants = Variants.guess_from(`Canta${color}-light-compact`);
		t.is(variants.day, `Canta${color}-light-compact`);
		t.is(variants.night, `Canta${color}-dark-compact`);
	});
});
