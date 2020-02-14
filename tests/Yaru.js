const test = require('ava');
const { Variants } = require('./_variants');


test('Yaru', t => {
	const variants = Variants.guess_from('Yaru');
	t.is(variants.day, 'Yaru');
	t.is(variants.night, 'Yaru-dark');
});

test('Yaru-dark', t => {
	const variants = Variants.guess_from('Yaru-dark');
	t.is(variants.day, 'Yaru');
	t.is(variants.night, 'Yaru-dark');
});

test('Yaru-light', t => {
	const variants = Variants.guess_from('Yaru-light');
	t.is(variants.day, 'Yaru-light');
	t.is(variants.night, 'Yaru-dark');
});
