const test = require('ava');
const { Variants } = require('./_variants');


test('Adwaita', t => {
	const variants = Variants.guess_from('Adwaita');
	t.is(variants.day, 'Adwaita');
	t.is(variants.night, 'Adwaita-dark');
});

test('Adwaita-dark', t => {
	const variants = Variants.guess_from('Adwaita-dark');
	t.is(variants.day, 'Adwaita');
	t.is(variants.night, 'Adwaita-dark');
});
