const test = require('ava');
const { Variants } = require('./_variants');


test('Arc', t => {
	const variants = Variants.guess_from('Arc');
	t.is(variants.day, 'Arc');
	t.is(variants.night, 'Arc-Dark');
});

test('Arc-Dark', t => {
	const variants = Variants.guess_from('Arc-Dark');
	t.is(variants.day, 'Arc');
	t.is(variants.night, 'Arc-Dark');
});

test('Arc-Darker', t => {
	const variants = Variants.guess_from('Arc-Darker');
	t.is(variants.day, 'Arc-Darker');
	t.is(variants.night, 'Arc-Dark');
});

test('Arc-Darker-solid', t => {
	const variants = Variants.guess_from('Arc-Darker-solid');
	t.is(variants.day, 'Arc-Darker-solid');
	t.is(variants.night, 'Arc-Dark-solid');
});

test('Arc-Dark-solid', t => {
	const variants = Variants.guess_from('Arc-Dark-solid');
	t.is(variants.day, 'Arc-solid');
	t.is(variants.night, 'Arc-Dark-solid');
});

test('Arc-solid', t => {
	const variants = Variants.guess_from('Arc-solid');
	t.is(variants.day, 'Arc-solid');
	t.is(variants.night, 'Arc-Dark-solid');
});
