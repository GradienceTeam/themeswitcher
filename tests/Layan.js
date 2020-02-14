const test = require('ava');
const { Variants } = require('./_variants');


test('Layan', t => {
	const variants = Variants.guess_from('Layan');
	t.is(variants.day, 'Layan');
	t.is(variants.night, 'Layan-dark');
});

test('Layan-dark', t => {
	const variants = Variants.guess_from('Layan-dark');
	t.is(variants.day, 'Layan');
	t.is(variants.night, 'Layan-dark');
});

test('Layan-light', t => {
	const variants = Variants.guess_from('Layan-light');
	t.is(variants.day, 'Layan-light');
	t.is(variants.night, 'Layan-dark');
});

test('Layan-solid', t => {
	const variants = Variants.guess_from('Layan-solid');
	t.is(variants.day, 'Layan-solid');
	t.is(variants.night, 'Layan-dark-solid');
});

test('Layan-dark-solid', t => {
	const variants = Variants.guess_from('Layan-dark-solid');
	t.is(variants.day, 'Layan-solid');
	t.is(variants.night, 'Layan-dark-solid');
});

test('Layan-light-solid', t => {
	const variants = Variants.guess_from('Layan-light-solid');
	t.is(variants.day, 'Layan-light-solid');
	t.is(variants.night, 'Layan-dark-solid');
});
