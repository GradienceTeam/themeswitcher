const test = require('ava');
const { Variants } = require('./_variants');


test('HighContrast', t => {
	const variants = Variants.guess_from('HighContrast');
	t.is(variants.day, 'HighContrast');
	t.is(variants.night, 'HighContrastInverse');
});

test('HighContrastInverse', t => {
	const variants = Variants.guess_from('HighContrastInverse');
	t.is(variants.day, 'HighContrast');
	t.is(variants.night, 'HighContrastInverse');
});
