const test = require('ava');
const { Variants } = require('./_variants');


test('Adapta', t => {
	const variants = Variants.guess_from('Adapta');
	t.is(variants.day, 'Adapta');
	t.is(variants.night, 'Adapta-Nokto')
});

test('Adapta-Nokto', t => {
	const variants = Variants.guess_from('Adapta-Nokto');
	t.is(variants.day, 'Adapta');
	t.is(variants.night, 'Adapta-Nokto');
});

test('Adapta-Eta', t => {
	const variants = Variants.guess_from('Adapta-Eta');
	t.is(variants.day, 'Adapta-Eta');
	t.is(variants.night, 'Adapta-Nokto-Eta');
});

test('Adapta-Nokto-Eta', t => {
	const variants = Variants.guess_from('Adapta-Nokto-Eta');
	t.is(variants.day, 'Adapta-Eta');
	t.is(variants.night, 'Adapta-Nokto-Eta');
});
